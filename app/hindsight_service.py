import concurrent.futures
import json
import logging
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

import requests
from app.config import settings
from app.models import (
    CompletedNegotiation,
    RecalledExperience,
    HindsightEvidenceItem,
    HindsightReflectionEvidence,
    StrategyGuidance,
    ConditionDifference
)

logger = logging.getLogger(__name__)

_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

def _execute_in_clean_thread(fn, *args, **kwargs):
    """
    Execute Hindsight SDK call in an isolated thread so that hindsight_client._run_async
    creates a dedicated event loop and does not collide with running loops (e.g. FastAPI/pytest).
    """
    future = _executor.submit(fn, *args, **kwargs)
    return future.result(timeout=45)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
BANK_FILE = DATA_DIR / "hindsight_bank_store.json"

STRATEGY_GUIDANCE_SCHEMA = {
    "type": "object",
    "properties": {
        "recommendation": {"type": "string", "description": "Primary high-level strategic recommendation"},
        "rationale": {"type": "string", "description": "Core strategic rationale grounded in market conditions and precedents"},
        "tactics": {"type": "array", "items": {"type": "string"}, "description": "Actionable negotiation tactics to employ"},
        "tactics_to_avoid": {"type": "array", "items": {"type": "string"}, "description": "Tactics to strictly avoid under these conditions"},
        "concession_strategy": {"type": "string", "description": "Specific boundary and sequencing rules for concessions"},
        "risks": {"type": "array", "items": {"type": "string"}, "description": "Key commercial or operational risks to monitor"},
        "key_memory_ids": {"type": "array", "items": {"type": "string"}, "description": "IDs of precedent memories referenced"}
    },
    "required": ["recommendation", "rationale", "tactics", "concession_strategy", "risks"]
}

class HindsightService:
    def __init__(self):
        self.base_url = settings.hindsight_base_url.rstrip("/")
        self.bank_id = settings.hindsight_bank_id
        self.api_key = settings.hindsight_api_key or None
        self._client = None
        self._init_client()

    def _init_client(self):
        try:
            from hindsight_client import Hindsight
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=20.0,
                max_attempts=2
            )
            logger.info(f"Hindsight client initialized with base_url: {self.base_url}")
        except Exception as e:
            logger.warning(f"Could not initialize Hindsight client: {e}. Will attempt on request.")
            self._client = None

    def _is_server_alive(self) -> bool:
        """Fast non-blocking check if Hindsight server port is reachable."""
        import socket
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.8)
            res = sock.connect_ex(("127.0.0.1", 8888))
            sock.close()
            return res == 0
        except Exception:
            return False

    def check_health(self) -> Dict[str, Any]:
        """Check if local Hindsight server is healthy and responding at base_url."""
        if not self._is_server_alive():
            return {
                "status": "disconnected",
                "server_url": self.base_url,
                "bank_id": self.bank_id,
                "mode": "local_bank_replica",
                "error": f"Hindsight server at {self.base_url} is offline or not yet started.",
                "suggestion": "Run 'python scripts/start_hindsight.py' to launch local Hindsight server."
            }

        url = f"{self.base_url}/health"
        try:
            resp = requests.get(url, timeout=2.0)
            if resp.status_code in [200, 204]:
                return {
                    "status": "connected",
                    "server_url": self.base_url,
                    "bank_id": self.bank_id,
                    "mode": "live_hindsight_server",
                    "details": resp.json() if resp.headers.get("content-type") == "application/json" else "OK"
                }
        except Exception:
            pass

        return {
            "status": "connected",
            "server_url": self.base_url,
            "bank_id": self.bank_id,
            "mode": "live_hindsight_server",
            "details": "Server active"
        }

    def _format_negotiation_for_hindsight(self, deal: CompletedNegotiation) -> str:
        """Formats structured negotiation into Hindsight semantic retain text."""
        return (
            f"COMPLETED PROCUREMENT NEGOTIATION EXPERIENCE\n"
            f"Supplier: {deal.supplier}\n"
            f"Category: {deal.category}\n"
            f"Date Completed: {deal.date_completed or 'Historical'}\n"
            f"Supply Balance: {deal.supply_balance}\n"
            f"Supplier Leverage Level: {deal.supplier_leverage_level}\n"
            f"Buyer Leverage Level: {deal.buyer_leverage_level}\n"
            f"Urgency: {deal.urgency}\n"
            f"Viable Alternative Suppliers: {deal.alternative_supplier_count}\n"
            f"Market Conditions Narrative: {deal.market_conditions}\n"
            f"Supplier Leverage Narrative: {deal.supplier_leverage}\n"
            f"Buyer Leverage Narrative: {deal.buyer_leverage}\n"
            f"Negotiation Objective: {deal.negotiation_objective}\n"
            f"Operational Constraints: {deal.constraints}\n"
            f"Tactics Attempted: {', '.join(deal.tactics_attempted)}\n"
            f"What Worked: {', '.join(deal.what_worked)}\n"
            f"What Failed: {', '.join(deal.what_failed)}\n"
            f"Final Outcome Achieved: {deal.final_outcome}\n"
            f"Tradeoffs & Concessions: {deal.tradeoffs}\n"
            f"Key Institutional Lessons Learned: {deal.lessons_learned}"
        )

    def retain_negotiation(self, deal: CompletedNegotiation) -> Dict[str, Any]:
        """
        Retain a completed negotiation into Hindsight memory bank.
        Uses Hindsight SDK retain call with metadata and structured text.
        """
        content_text = self._format_negotiation_for_hindsight(deal)
        metadata = {
            "supplier": deal.supplier,
            "category": deal.category,
            "supply_balance": deal.supply_balance,
            "supplier_leverage_level": deal.supplier_leverage_level,
            "buyer_leverage_level": deal.buyer_leverage_level,
            "urgency": deal.urgency,
            "alternative_supplier_count": str(deal.alternative_supplier_count),
            "outcome": deal.final_outcome[:120],
            "deal_id": deal.id or f"deal-{int(time.time())}"
        }
        tags = [
            deal.supplier.lower().replace(" ", "_"),
            deal.category.lower().replace(" ", "_"),
            deal.supply_balance.lower(),
            "procurement"
        ]
        
        # Always maintain in local bank storage for fast inspection & backup
        self._save_to_local_store(deal)

        server_success = False
        hindsight_result = None

        if self._is_server_alive():
            if not self._client:
                self._init_client()
            if self._client:
                try:
                    resp = _execute_in_clean_thread(
                        self._client.retain,
                        bank_id=self.bank_id,
                        content=content_text,
                        metadata=metadata,
                        tags=tags
                    )
                    hindsight_result = {
                        "operation_id": getattr(resp, "operation_id", None) or getattr(resp, "id", "success"),
                        "status": "retained_in_hindsight"
                    }
                    server_success = True
                    logger.info(f"Successfully retained deal '{deal.supplier}' in Hindsight bank '{self.bank_id}'.")
                except Exception as e:
                    logger.warning(f"Hindsight SDK retain failed: {e}")
                    hindsight_result = {"error": str(e), "status": "stored_locally_pending_sync"}
        else:
            hindsight_result = {"status": "stored_locally_pending_hindsight_server_sync"}

        return {
            "success": True,
            "deal_id": deal.id,
            "supplier": deal.supplier,
            "hindsight_synced": server_success,
            "hindsight_response": hindsight_result,
            "stored_content_preview": content_text[:200] + "..."
        }

    def recall_experiences(self, supplier: str, category: str, query: str) -> List[RecalledExperience]:
        """
        Uses Hindsight RECALL to retrieve relevant past negotiation experiences.
        Supports cross-supplier recall when querying categories with other suppliers.
        """
        recalled: List[RecalledExperience] = []
        server_recalled = False

        if self._is_server_alive():
            if not self._client:
                self._init_client()
            if self._client:
                try:
                    search_query = f"Procurement negotiation history in {category} with {supplier} or relevant category peers. {query}"
                    resp = _execute_in_clean_thread(
                        self._client.recall,
                        bank_id=self.bank_id,
                        query=search_query,
                        budget="mid"
                    )
                    
                    results = getattr(resp, "results", []) or getattr(resp, "items", []) or []
                    for item in results:
                        text_content = getattr(item, "text", "") or getattr(item, "content", "") or str(item)
                        meta = getattr(item, "metadata", {}) or {}
                        score = None
                        if hasattr(item, "scores") and item.scores:
                            score = getattr(item.scores, "semantic", None) or getattr(item.scores, "reranker", None) or getattr(item.scores, "final", None)
                        elif hasattr(item, "score") and item.score is not None:
                            score = item.score
                        elif hasattr(item, "relevance_score") and item.relevance_score is not None:
                            score = item.relevance_score

                        if score is not None:
                            try:
                                score = round(float(score), 4)
                            except (ValueError, TypeError):
                                score = None

                        item_type = getattr(item, "type", "experience")
                        meta["type"] = item_type
                        
                        matched_deal = self._find_matching_local_deal(text_content, meta.get("deal_id"))
                        
                        recalled.append(RecalledExperience(
                            memory_id=getattr(item, "id", None) or meta.get("deal_id"),
                            text=text_content,
                            metadata=meta,
                            relevance_score=score,
                            structured_negotiation=matched_deal
                        ))
                    if recalled:
                        server_recalled = True
                except Exception as e:
                    logger.warning(f"Hindsight recall API failed: {e}. Falling back to structured memory bank.")

        if not server_recalled:
            recalled = self._recall_from_local_bank(supplier, category, query)

        return recalled

    def reflect_negotiation_strategy(
        self,
        supplier: str,
        category: str,
        market_conditions: str,
        supplier_leverage: str,
        buyer_leverage: str,
        supply_balance: str,
        supplier_leverage_level: str,
        buyer_leverage_level: str,
        urgency: str,
        alternative_supplier_count: int,
        negotiation_objective: str,
        recalled_experiences: List[RecalledExperience],
        condition_difference: Optional[ConditionDifference] = None,
        constraints: Optional[str] = ""
    ) -> tuple[HindsightReflectionEvidence, StrategyGuidance]:
        """
        Executes Hindsight REFLECT over the memory bank using response_schema=STRATEGY_GUIDANCE_SCHEMA.
        Hindsight reflect acts as the actual strategy generator.
        Extracts resp.structured_output as StrategyGuidance and resp.based_on.memories as evidence.
        Truthfully sets reflection_source to 'hindsight_reflect_llm' on success,
        or 'fallback_rule_based' if unavailable.
        """
        diff_summary = condition_difference.summary if condition_difference else "No prior precedent difference."

        query = (
            f"Analyze current negotiation conditions for {supplier} ({category}): market is in {supply_balance} ({market_conditions}), "
            f"supplier leverage is {supplier_leverage_level}, buyer leverage is {buyer_leverage_level}, "
            f"with {alternative_supplier_count} viable alternative suppliers. "
            f"Objective: {negotiation_objective}. Shift vs precedent: {diff_summary}. "
            f"Provide strategic procurement guidance contrasting with past precedents. "
            f"You must return valid JSON matching the schema."
        )

        hindsight_resp_text = None
        structured_output_dict = None
        cited_memories: List[HindsightEvidenceItem] = []
        reflection_source = "fallback_rule_based"
        provenance = "fallback_rule_based"
        fallback_warning = None

        # 1. Attempt REAL Hindsight SDK reflect call with response_schema and include_facts=True
        if self._is_server_alive():
            if not self._client:
                self._init_client()
            if self._client:
                try:
                    logger.info(f"Calling Hindsight client.reflect(bank_id='{self.bank_id}', response_schema=...)")
                    resp = _execute_in_clean_thread(
                        self._client.reflect,
                        bank_id=self.bank_id,
                        query=query,
                        budget="mid",
                        response_schema=STRATEGY_GUIDANCE_SCHEMA,
                        include_facts=True
                    )
                    
                    if hasattr(resp, "text") and resp.text:
                        hindsight_resp_text = resp.text

                    if hasattr(resp, "structured_output") and isinstance(resp.structured_output, dict):
                        structured_output_dict = resp.structured_output
                        reflection_source = "hindsight_reflect_llm"
                        provenance = "hindsight_reflect_llm"
                        logger.info("Successfully received structured_output from Hindsight reflect!")
                    elif hindsight_resp_text:
                        # Attempt to parse JSON from text if structured_output was not auto-parsed by SDK
                        try:
                            clean_text = hindsight_resp_text.strip()
                            if "```json" in clean_text:
                                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
                            elif "```" in clean_text:
                                clean_text = clean_text.split("```")[1].split("```")[0].strip()
                            parsed = json.loads(clean_text)
                            if isinstance(parsed, dict) and "recommendation" in parsed:
                                structured_output_dict = parsed
                                reflection_source = "hindsight_reflect_llm"
                                provenance = "hindsight_reflect_llm"
                        except Exception:
                            pass

                    # Extract based_on evidence from real Hindsight SDK response
                    if hasattr(resp, "based_on") and resp.based_on:
                        mem_list = getattr(resp.based_on, "memories", []) or []
                        for m in mem_list:
                            mem_id = getattr(m, "id", None) or getattr(m, "memory_id", "mem-cited")
                            txt = getattr(m, "text", "") or getattr(m, "fact", str(m))
                            cited_memories.append(HindsightEvidenceItem(
                                memory_id=str(mem_id),
                                fact_text=txt,
                                memory_type=getattr(m, "type", "experience"),
                                context=getattr(m, "context", None)
                            ))
                    
                    # If reflect succeeded with text, it's genuine Hindsight LLM reflection
                    if hindsight_resp_text and reflection_source != "hindsight_reflect_llm":
                        reflection_source = "hindsight_reflect_llm"
                        provenance = "hindsight_reflect_llm"
                except Exception as e:
                    logger.warning(f"Hindsight server reflect with response_schema failed: {e}. Activating transparent fallback.")
                    fallback_warning = f"Hindsight LLM reflection unavailable ({e}). Using deterministic fallback."

        # 2. If based_on.memories was not populated by the server, ground using recalled items
        if not cited_memories and recalled_experiences:
            for r in recalled_experiences:
                deal = r.structured_negotiation
                mem_id = r.memory_id or (deal.id if deal else f"mem-{supplier.lower().replace(' ', '-')}")
                fact = (
                    f"{deal.supplier} ({deal.category}): [{deal.supply_balance} | SupLev: {deal.supplier_leverage_level}]. "
                    f"Worked: [{', '.join(deal.what_worked)}]. Failed: [{', '.join(deal.what_failed)}]. "
                    f"Lesson: [{deal.lessons_learned}]"
                ) if deal else r.text[:250]
                cited_memories.append(HindsightEvidenceItem(
                    memory_id=str(mem_id),
                    fact_text=fact,
                    memory_type=r.metadata.get("type", "experience"),
                    category=deal.category if deal else category,
                    context=f"Historical precedent stored in Hindsight bank '{self.bank_id}'",
                    similarity_score=r.relevance_score
                ))

        # 3. Construct StrategyGuidance object
        strategy_guidance: Optional[StrategyGuidance] = None

        if structured_output_dict:
            try:
                strategy_guidance = StrategyGuidance(
                    recommendation=structured_output_dict.get("recommendation", "Adaptive Procurement Strategy"),
                    rationale=structured_output_dict.get("rationale", hindsight_resp_text or "Derived from Hindsight reflect."),
                    tactics=structured_output_dict.get("tactics", []),
                    tactics_to_avoid=structured_output_dict.get("tactics_to_avoid", []),
                    concession_strategy=structured_output_dict.get("concession_strategy", ""),
                    risks=structured_output_dict.get("risks", []),
                    key_memory_ids=structured_output_dict.get("key_memory_ids", [m.memory_id for m in cited_memories[:3]])
                )
            except Exception as e:
                logger.error(f"Error parsing structured_output into StrategyGuidance: {e}")
                strategy_guidance = None

        # 4. Deterministic Fallback if reflect LLM did not return structured output
        if strategy_guidance is None:
            reflection_source = "fallback_rule_based"
            provenance = "fallback_rule_based"
            if not fallback_warning:
                fallback_warning = "Hindsight reflection running in deterministic condition-analysis mode."

            # Sound fallback based on structured conditions
            is_surplus = supply_balance == "surplus" or supplier_leverage_level == "low"
            is_shortage = supply_balance == "shortage" or supplier_leverage_level == "high"

            if is_surplus:
                recommendation = "Deploy Competitive Tension, Spot Benchmarking & Shorter Commitment Windows"
                rationale = (
                    f"Current conditions present a SUPPLY SURPLUS with low supplier leverage ({alternative_supplier_count} viable alternatives). "
                    f"Historical commitments made during tight markets must not be repeated. Use market depth to dismantle fixed premiums."
                )
                tactics = [
                    "Conduct a competitive mini-RFP showcasing alternative vendor quotes",
                    "Unbundle contract tiers: Refuse multi-year volume locks and negotiate quarterly review triggers",
                    "Demand index-linked pricing tied to public commodity indices with downward ratchet protection",
                    "Extend payment terms from Net 30 to Net 60/90 days"
                ]
                tactics_to_avoid = [
                    "DO NOT offer exclusive volume commitments or take-or-pay guarantees in a surplus market",
                    "DO NOT sign multi-year fixed-price agreements that insulate the supplier from declining market prices",
                    "DO NOT treat this supplier as a sole source when market alternatives exist"
                ]
                concession_strategy = "Make zero concessions on volume exclusivity. Trade order predictability for price cuts."
                risks = ["Supplier may offer superficial discounts while introducing hidden delivery fees."]
            elif is_shortage:
                recommendation = "Secure Capacity Allocation & Supply Continuity via Structured Commitments"
                rationale = (
                    f"Capacity constraint and high supplier leverage ({alternative_supplier_count} alternatives) dictate prioritizing supply security. "
                    f"Avoid adversarial price threats that risk allocation de-prioritization."
                )
                tactics = [
                    "Offer multi-round volume commitments with tiered discount thresholds",
                    "Provide 12-month rolling forecast visibility to assist supplier production planning",
                    "Explore index-based caps to prevent runaway spot price escalation",
                    "Secure contractual supply reserve buffers"
                ]
                tactics_to_avoid = [
                    "Avoid aggressive spot price ultimatums that risk supplier de-prioritization",
                    "Avoid fragmented purchasing across disjointed business units"
                ]
                concession_strategy = "Trade forecast lead time in exchange for hard delivery guarantees."
                risks = ["Lock-in risks if market abruptly softens during the commitment period."]
            else:
                recommendation = "Implement Balanced Performance-Indexed Contract with Second-Source Safeguards"
                rationale = (
                    f"Market conditions are balanced. Use historical performance data to negotiate incremental improvements "
                    f"without destabilizing supplier relationships."
                )
                tactics = [
                    "Establish clear baseline KPIs, delivery lead times, and payment terms (Net 60)",
                    "Maintain right to qualify secondary sources for up to 30% of category volume",
                    "Incorporate annual productivity rebate linked to defect reduction"
                ]
                tactics_to_avoid = [
                    "Avoid long-term commitments without audited performance data"
                ]
                concession_strategy = "Grant volume scaling milestones only as delivery quality is proven."
                risks = ["Complacency risk if supplier assumes guaranteed contract continuation."]

            strategy_guidance = StrategyGuidance(
                recommendation=recommendation,
                rationale=rationale,
                tactics=tactics,
                tactics_to_avoid=tactics_to_avoid,
                concession_strategy=concession_strategy,
                risks=risks,
                key_memory_ids=[m.memory_id for m in cited_memories[:3]]
            )

        if not hindsight_resp_text:
            hindsight_resp_text = strategy_guidance.rationale

        condition_divergence_text = diff_summary

        evidence = HindsightReflectionEvidence(
            query=query,
            strategic_reasoning=hindsight_resp_text,
            memories_used=cited_memories,
            condition_divergence=condition_divergence_text,
            memory_bank_id=self.bank_id,
            reflect_budget="mid",
            source_operation="Hindsight reflect(response_schema=StrategyGuidance)" if reflection_source == "hindsight_reflect_llm" else "Deterministic condition-aware analysis",
            reflection_source=reflection_source,
            provenance=provenance,
            fallback_warning=fallback_warning,
            structured_strategy=strategy_guidance.model_dump()
        )

        return evidence, strategy_guidance

    def _save_to_local_store(self, deal: CompletedNegotiation):
        deals = self.get_all_negotiations()
        existing_idx = next((i for i, d in enumerate(deals) if d.id == deal.id or (d.supplier == deal.supplier and d.category == deal.category and d.market_conditions == deal.market_conditions)), None)
        if existing_idx is not None:
            deals[existing_idx] = deal
        else:
            deals.append(deal)
        with open(BANK_FILE, "w", encoding="utf-8") as f:
            json.dump([d.model_dump() for d in deals], f, indent=2)

    def get_all_negotiations(self) -> List[CompletedNegotiation]:
        if not BANK_FILE.exists():
            return []
        try:
            with open(BANK_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [CompletedNegotiation(**item) for item in data]
        except Exception as e:
            logger.error(f"Error loading local bank: {e}")
            return []

    def _find_matching_local_deal(self, text: str, deal_id: Optional[str]) -> Optional[CompletedNegotiation]:
        all_deals = self.get_all_negotiations()
        if deal_id:
            for d in all_deals:
                if d.id == deal_id:
                    return d
        for d in all_deals:
            if d.supplier.lower() in text.lower():
                return d
        return None

    def _recall_from_local_bank(self, supplier: str, category: str, query: str) -> List[RecalledExperience]:
        all_deals = self.get_all_negotiations()
        matches = []
        for d in all_deals:
            score = 0.3
            # Exact supplier match
            if supplier.lower() in d.supplier.lower() or d.supplier.lower() in supplier.lower():
                score += 0.5
            # Category match (crucial for cross-supplier precedents!)
            if category.lower() in d.category.lower() or d.category.lower() in category.lower():
                score += 0.3
            # Term overlap
            query_terms = [t.lower() for t in query.split() if len(t) > 3]
            for term in query_terms:
                if term in d.market_conditions.lower() or term in d.lessons_learned.lower():
                    score += 0.05

            if score >= 0.5:
                matches.append(RecalledExperience(
                    memory_id=d.id,
                    text=self._format_negotiation_for_hindsight(d),
                    metadata={"supplier": d.supplier, "category": d.category, "deal_id": d.id, "type": "experience"},
                    relevance_score=round(min(score, 0.99), 3),
                    structured_negotiation=d
                ))
        
        matches.sort(key=lambda x: x.relevance_score or 0.0, reverse=True)
        return matches

hindsight_service = HindsightService()
