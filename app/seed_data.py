from typing import List
from app.models import CompletedNegotiation

SEED_NEGOTIATIONS: List[CompletedNegotiation] = [
    CompletedNegotiation(
        id="deal-alpha-shortage-001",
        supplier="Alpha Supplier",
        category="Raw Materials",
        market_conditions="Supply shortage, global logistics bottleneck, tight capacity, single source reliance.",
        supplier_leverage="High (Exclusive supplier with 6-month order backlog and zero spare market volume)",
        buyer_leverage="Low (No approved alternate suppliers in the short term, severe production shutdown risk)",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=0,
        negotiation_objective="Achieve price stability, secure capacity allocation, and reduce baseline costs for 18 months",
        constraints="Zero buffer inventory, cannot afford factory stockouts, rigid OEM qualification specs",
        tactics_attempted=[
            "Spot market price benchmarking threats",
            "Payment terms concession",
            "Multi-year volume commitment (85% share of wallet with take-or-pay guarantee)"
        ],
        what_worked=[
            "Multi-year 85% volume commitment in exchange for price freeze and priority allocation guarantee",
            "Quarterly forecast transparency and joint demand planning sessions"
        ],
        what_failed=[
            "Aggressive spot benchmark threats (Supplier immediately balked and threatened to reallocate capacity to competing OEM)"
        ],
        final_outcome="Achieved 12% discount off spot index and secured 100% guaranteed allocation for 18 months",
        tradeoffs="Locked procurement into exclusive 85% volume commitment; financial penalty if annual purchase drops below 85%",
        lessons_learned="In a supply shortage with high supplier leverage, volume commitment is the primary currency. Threatening alternatives backfires when market capacity is constrained. Exclusivity commitment was necessary to protect factory continuity.",
        date_completed="2024-03-15",
        tags=["Alpha Supplier", "Raw Materials", "Shortage", "Volume Commitment", "High Supplier Leverage"]
    ),
    CompletedNegotiation(
        id="deal-alpha-surplus-002",
        supplier="Alpha Supplier",
        category="Raw Materials",
        market_conditions="Global capacity expansion, market surplus, raw material prices plummeting 22%, 4 qualified alternative mills.",
        supplier_leverage="Low (Alpha operating at 65% capacity utilization, hungry for order volume)",
        buyer_leverage="High (Four pre-qualified alternative mills ready to supply within 14 days)",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="flexible",
        alternative_supplier_count=4,
        negotiation_objective="Demand 18% cost-down, eliminate take-or-pay clauses, and transition to floating market index pricing",
        constraints="Maintain baseline ASTM metallurgical tolerances and uninterrupted rail delivery schedules",
        tactics_attempted=[
            "Competitive mini-RFP showcasing 4 alternative vendor quotes",
            "Demand unbundled contract terms and quarterly price reviews",
            "Refusal of multi-year exclusivity locks"
        ],
        what_worked=[
            "Presenting anonymized competitive quotes from secondary mills forced Alpha to drop base price by 16%",
            "Transitioning from fixed-annual contract to index-linked pricing with quarterly downward ratchets",
            "Removing take-or-pay penalties entirely"
        ],
        what_failed=[
            "Offering volume lock-in (deliberately avoided because locking volume would forfeit downstream savings in a declining market)"
        ],
        final_outcome="16% unit cost reduction, elimination of volume lock-in, Net 60 payment terms, quarterly market index adjustments",
        tradeoffs="Agreed to grant Alpha 50% baseline allocation if their quarterly index price remains within 2% of market median",
        lessons_learned="In a market surplus with low supplier leverage, NEVER repeat the shortage playbook of volume lock-ins. Use competitive alternatives to dismantle rigid terms and demand flexible index pricing.",
        date_completed="2024-11-20",
        tags=["Alpha Supplier", "Raw Materials", "Surplus", "Competitive RFP", "Index Pricing"]
    ),
    CompletedNegotiation(
        id="deal-beta-components-003",
        supplier="Beta Electronics",
        category="Electronic Components & Microcontrollers",
        market_conditions="Moderate demand, lead times stabilizing from 32 weeks to 10 weeks, 2 secondary suppliers emerging.",
        supplier_leverage="Medium (Established design-in component, but pin-compatible second source exists)",
        buyer_leverage="Medium (Qualifying secondary source within 90 days)",
        supply_balance="balanced",
        supplier_leverage_level="medium",
        buyer_leverage_level="medium",
        urgency="normal",
        alternative_supplier_count=2,
        negotiation_objective="Secure 8% cost-down and increase payment terms from Net 30 to Net 60",
        constraints="Design engineering sign-off required for second source switchover",
        tactics_attempted=[
            "Dual-sourcing qualification announcement",
            "Tiered rebate structure based on growth",
            "Aggressive Net 90 payment demand"
        ],
        what_worked=[
            "Visible dual-sourcing trial run induced Beta to match pricing to protect 70% allocation",
            "Tiered volume rebates that reward cross-category purchasing"
        ],
        what_failed=[
            "Demanding Net 90 payment terms (supplier threatened to delay engineering change orders; settled at Net 60)"
        ],
        final_outcome="7.5% price reduction on core MCUs, Net 60 terms, split volume 70/30 with secondary vendor",
        tradeoffs="Retained primary supplier for 70% volume while incurring minor dual-source qualification testing fees",
        lessons_learned="Visible credible alternatives create leverage even before full switchover. Credible dual-sourcing breaks supplier complacency without burning relationships.",
        date_completed="2024-07-20",
        tags=["Beta Electronics", "Electronic Components", "Dual-Sourcing", "Medium Leverage"]
    ),
    CompletedNegotiation(
        id="deal-gamma-freight-004",
        supplier="Gamma Logistics",
        category="Logistics & Freight Forwarding",
        market_conditions="Market capacity expansion, container spot rates collapsing by 35%, intense carrier rivalry.",
        supplier_leverage="Low (Overcapacity in transpacific lanes, high competition among forwarders)",
        buyer_leverage="High (High aggregated shipping volume, multiple tier-1 freight forwarders aggressively bidding)",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="flexible",
        alternative_supplier_count=5,
        negotiation_objective="Contract rate reduction of 25% with flexible quarterly index adjustments",
        constraints="Must maintain stringent 98.5% on-time delivery SLA and customs clearance speed",
        tactics_attempted=[
            "Reverse e-auction across 4 carriers",
            "Index-linked floating rate contract rather than fixed rate",
            "Consolidated multi-lane bidding"
        ],
        what_worked=[
            "Reverse e-auction forced Gamma to aggressively undercut competitors",
            "Index-linked floating fuel surcharge to capture downward spot market momentum"
        ],
        what_failed=[
            "Multi-year fixed rate locking (deliberately avoided because market was trending down; locking fixed rate would have overpaid)"
        ],
        final_outcome="28% rate reduction, quarterly index adjustments, zero demurrage penalty on port delays",
        tradeoffs="Agreed to give Gamma first right of refusal on high-margin urgent air freight lanes",
        lessons_learned="In surplus markets with low supplier leverage, NEVER lock in multi-year fixed commitments. Use index-linked rates, unbundle services, and leverage competitive bidding.",
        date_completed="2024-11-10",
        tags=["Gamma Logistics", "Freight", "Surplus", "Reverse Auction", "Index-Linked"]
    ),
    CompletedNegotiation(
        id="deal-delta-packaging-005",
        supplier="Delta Packaging",
        category="Packaging & Corrugated",
        market_conditions="Paper pulp index stable, local corrugated box conversion capacity balanced with regional demand.",
        supplier_leverage="Medium (Tooling dies already paid and calibrated for our assembly lines)",
        buyer_leverage="Medium (3 regional box makers within 50-mile radius with identical flute capabilities)",
        supply_balance="balanced",
        supplier_leverage_level="medium",
        buyer_leverage_level="medium",
        urgency="normal",
        alternative_supplier_count=3,
        negotiation_objective="Implement transparent pulp index cost pass-through and 5% productivity rebate",
        constraints="Just-in-time delivery required with 24-hour replenishment cycle to avoid plant warehouse clutter",
        tactics_attempted=[
            "Unbundling paper pulp index from conversion labor margin",
            "Annual productivity rebate linked to scrap rate reduction",
            "Threatening to pull tooling dies"
        ],
        what_worked=[
            "Open-book pulp index pass-through formula with quarterly true-ups",
            "Scrap reduction gainsharing rebate model"
        ],
        what_failed=[
            "Threatening to pull tooling dies (caused delivery friction and threatened line stoppages)"
        ],
        final_outcome="Adopted transparent cost model yielding 6.2% net savings, secured 24-hour JIT delivery guarantee",
        tradeoffs="Agreed to 18-month agreement with bi-annual volume adjustments",
        lessons_learned="In balanced packaging markets, unbundling raw commodity costs from conversion margins eliminates supplier opacity without adversarial confrontation.",
        date_completed="2024-05-14",
        tags=["Delta Packaging", "Packaging", "Index Pass-Through", "Balanced Market"]
    ),
    CompletedNegotiation(
        id="deal-epsilon-chemicals-006",
        supplier="Epsilon Specialty Chemicals",
        category="Specialty Chemicals",
        market_conditions="Strict EPA and REACH environmental compliance limits suppliers; global catalyst precursor bottleneck.",
        supplier_leverage="High (Patented synthesis process, 1 of only 2 certified global producers)",
        buyer_leverage="Low (Reformulating product to remove compound requires 9-month FDA re-certification)",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=1,
        negotiation_objective="Cap price surge below 15% and secure minimum 120-day strategic consignment buffer",
        constraints="Regulatory validation takes 9 months; zero tolerance for impurity variations",
        tactics_attempted=[
            "Consignment inventory financing partnership",
            "Take-or-pay floor in exchange for guaranteed safety stock",
            "Legal challenge on patent exclusivity"
        ],
        what_worked=[
            "Financing on-site vendor consignment inventory buffer to guarantee zero production downtime",
            "Long-term 2-year purchase agreement with fixed escalation ceiling (+8% max)"
        ],
        what_failed=[
            "Challenging proprietary formulation IP (supplier halted contract negotiations until legal threat was formally withdrawn)"
        ],
        final_outcome="Price increase capped at 8.5% (down from 20% requested), secured 60-day vendor-owned consignment buffer on-site",
        tradeoffs="Committed to 2-year sole-source status for that specific formulation",
        lessons_learned="When suppliers hold high leverage through IP and regulatory moats, confrontational legal tactics backfire. Partner on inventory carrying arrangements and ceiling price caps.",
        date_completed="2024-02-18",
        tags=["Epsilon Chemicals", "Chemicals", "High Leverage", "Consignment Buffer", "Shortage"]
    ),
    CompletedNegotiation(
        id="deal-zeta-microchips-007",
        supplier="Zeta Technologies",
        category="Electronic Components & Microcontrollers",
        market_conditions="Global semiconductor wafer fabrication crunch, 48-week foundry lead times, allocation quotas enforced.",
        supplier_leverage="High (Zeta holds primary wafer allocations; fab capacity oversubscribed by 140%)",
        buyer_leverage="Low (Proprietary ARM core architecture; PCB redesign would cost $400k and take 8 months)",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=0,
        negotiation_objective="Secure committed delivery schedule for 250,000 units and prevent spot allocation de-prioritization",
        constraints="No viable second source available without complete PCB board re-engineering",
        tactics_attempted=[
            "Non-cancellable non-returnable (NCNR) forward order commitment",
            "Executive sponsor alignment and joint development roadmap access",
            "Demanding penalty clauses for late delivery"
        ],
        what_worked=[
            "12-month rolling binding NCNR order placement provided fab production visibility that secured Tier-1 allocation status",
            "C-level executive relationship bridging"
        ],
        what_failed=[
            "Demanding late delivery liquidated damages (Zeta outright rejected, stating OEM line-priority would be revoked)"
        ],
        final_outcome="100% volume allocation protected across 4 quarters, delivery certainty secured within +/- 5 days",
        tradeoffs="Committed to 100% firm NCNR orders with 30% upfront deposit on custom wafer batches",
        lessons_learned="Cross-supplier precedent: In critical semiconductor shortages with zero alternatives, attempting punitive penalty clauses destroys supplier goodwill. Committing binding demand visibility and upfront deposits is the only reliable path to secure scarce fab capacity.",
        date_completed="2024-01-25",
        tags=["Zeta Technologies", "Semiconductors", "Shortage", "High Leverage", "NCNR Allocation"]
    ),
    CompletedNegotiation(
        id="deal-eta-machining-008",
        supplier="Eta Precision Machining",
        category="Precision Machining",
        market_conditions="Automotive tooling downturn created widespread CNC machine idle capacity across Midwest suppliers.",
        supplier_leverage="Low (Supplier factory operating at 50% capacity, facing severe fixed overhead pressure)",
        buyer_leverage="High (4 local CNC machine shops actively underbidding each other for baseline run volumes)",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="normal",
        alternative_supplier_count=4,
        negotiation_objective="Achieve 20% unit cost reduction on milled aluminum housings and Net 60 terms",
        constraints="Parts must pass strict 5-axis CMM coordinate measuring inspections with zero defects",
        tactics_attempted=[
            "Target costing based on machine hourly rate benchmarking",
            "Short 6-month contract duration to maintain continuous competitive tension",
            "Tooling maintenance cost pass-back"
        ],
        what_worked=[
            "Should-cost breakdown revealing machine depreciation and cycle times, forcing 18.5% price cut",
            "6-month contract duration with automatic renewal conditional on zero defective PPM parts"
        ],
        what_failed=[
            "Demanding supplier absorb 100% of custom tooling wear without replacement allowance"
        ],
        final_outcome="18.5% price reduction, Net 60 terms, defect rate KPI penalty mechanism incorporated",
        tradeoffs="Granted priority production scheduling for steady baseload shift volume",
        lessons_learned="When manufacturing suppliers face machine idle time in a surplus market, should-cost modeling and short contract cycles extract maximum savings while maintaining quality.",
        date_completed="2024-08-30",
        tags=["Eta Machining", "Machining", "Surplus", "Should-Cost", "Competitive Tension"]
    ),
    CompletedNegotiation(
        id="deal-theta-cloud-009",
        supplier="Theta Cloud Services",
        category="SaaS & IT Infrastructure",
        market_conditions="Hyperscalers competing fiercely for enterprise AI and database workloads; cloud growth slowing.",
        supplier_leverage="Medium (High switching friction due to proprietary database dependencies)",
        buyer_leverage="Medium (Workloads containerized on Kubernetes; multi-cloud architecture viable)",
        supply_balance="balanced",
        supplier_leverage_level="medium",
        buyer_leverage_level="medium",
        urgency="flexible",
        alternative_supplier_count=2,
        negotiation_objective="Reduce annual cloud commitment spend by 22% and eliminate egress bandwidth fees",
        constraints="Production databases require seamless replication with zero downtime during contract transition",
        tactics_attempted=[
            "Multi-cloud pricing comparison leveraging competitive AWS/GCP migration credits",
            "Committed-use discount (CUD) restructuring from 3-year fixed to 1-year flexible",
            "Total egress waiver demand"
        ],
        what_worked=[
            "Credible multi-cloud architecture proof-of-concept triggered enterprise discount tier (-24%)",
            "Free data egress allocation up to 50TB per month"
        ],
        what_failed=[
            "Demanding full refund on unused past reserved instances"
        ],
        final_outcome="24% reduction in effective compute spend, 50TB monthly free egress, $80k training/migration credits",
        tradeoffs="Signed 2-year minimum annual spend commitment ($450k/year)",
        lessons_learned="Demonstrating workload portability through containerization neutralizes cloud vendor lock-in and unlocks enterprise tier discounting.",
        date_completed="2024-09-12",
        tags=["Theta Cloud", "SaaS", "Cloud Infrastructure", "Balanced", "Container Portability"]
    ),
    CompletedNegotiation(
        id="deal-iota-mro-010",
        supplier="Iota Industrial Supplies",
        category="MRO & Facilities Supplies",
        market_conditions="Highly fragmented distributor landscape, extensive catalog overlap, soft industrial demand.",
        supplier_leverage="Low (Commoditized standard products, zero proprietary differentiation)",
        buyer_leverage="High (Consolidating spend across 6 manufacturing plants into single national RFP)",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="flexible",
        alternative_supplier_count=6,
        negotiation_objective="Consolidate 12 fragmented local vendors into single distributor with 15% aggregate discount",
        constraints="Must support on-site vending machines and same-day delivery for critical safety gear",
        tactics_attempted=[
            "National master service agreement RFP with item basket benchmarking",
            "Consignment vendor-managed inventory (VMI) lockers",
            "Core item list price freeze for 24 months"
        ],
        what_worked=[
            "Item basket market benchmarking across top 200 SKUs achieved 17% savings",
            "Free installation of 14 on-site smart vending machines managed at supplier's expense",
            "Core SKU price freeze for 24 months"
        ],
        what_failed=[
            "Demanding 3% prompt-payment discount on top of Net 90 terms"
        ],
        final_outcome="17% average price drop across core items, on-site automated VMI, Net 60 terms, annual rebate ladder",
        tradeoffs="Standardized plant PPE and tools to Iota's primary partner brands",
        lessons_learned="In commoditized MRO spend, spend consolidation and item basket RFP create massive buyer dominance. Automating replenishment via VMI shifts inventory carrying costs to vendor.",
        date_completed="2024-06-05",
        tags=["Iota Supplies", "MRO", "Spend Consolidation", "Surplus", "VMI"]
    ),
    CompletedNegotiation(
        id="deal-kappa-logistics-011",
        supplier="Kappa Cold Chain Logistics",
        category="Temperature-Controlled Logistics",
        market_conditions="Refrigerated reefer truck capacity strained by strict pharma temperature logging mandates.",
        supplier_leverage="High (Limited validated fleet operators meeting FDA 21 CFR Part 11 cold compliance)",
        buyer_leverage="Low (Urgent vaccine product launch deadline with regulatory audit pending)",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=1,
        negotiation_objective="Guarantee 99.8% temperature adherence SLA and secure dedicated weekly reefer lanes",
        constraints="Product spoiled if temperature deviates by >2°C for more than 30 consecutive minutes",
        tactics_attempted=[
            "Dedicated lane reservation commitment",
            "Shared IoT real-time temperature telemetry integration",
            "Heavy financial liquidated damages for temperature excursions"
        ],
        what_worked=[
            "Guaranteed dedicated weekly lane commitments with volume floor in return for priority dispatch",
            "Joint telemetry integration providing predictive maintenance alerts"
        ],
        what_failed=[
            "Aggressive liquidated damages exceeding cargo insurance limits (supplier declined to bid until terms softened)"
        ],
        final_outcome="Dedicated reefer capacity guaranteed on 5 key routes, 99.9% temperature compliance SLA, capped fuel index",
        tradeoffs="Agreed to minimum weekly lane payment even during holiday shutdown weeks",
        lessons_learned="In high-compliance shortage environments, risk-sharing and dedicated volume guarantees succeed where punitive liability threats shut down negotiation.",
        date_completed="2024-04-10",
        tags=["Kappa Cold Chain", "Logistics", "Compliance", "Shortage", "SLA Guarantees"]
    ),
    CompletedNegotiation(
        id="deal-lambda-metals-012",
        supplier="Lambda Alloys & Steel",
        category="Raw Materials / Metals",
        market_conditions="Global steel production glut, construction demand contraction, scrap prices falling 18%.",
        supplier_leverage="Low (Mills operating at sub-optimal blast furnace efficiency due to low order volumes)",
        buyer_leverage="High (Five qualified service centers aggressively competing for our quarterly tonnage)",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="flexible",
        alternative_supplier_count=5,
        negotiation_objective="Secure 14% base steel price reduction and eliminate mill surcharge adders",
        constraints="Tolerances must meet aerospace grade AMS-5643 certification",
        tactics_attempted=[
            "Spot market price benchmarking with scrap index pass-through",
            "Short-term 90-day spot buys rather than annual contract lock",
            "Refusal to pay extra coil slitting processing fees"
        ],
        what_worked=[
            "Switching from annual fixed contracts to quarterly formula pricing tied to CRU Steel Index minus 4%",
            "Free coil slitting and protective packaging included at no surcharge"
        ],
        what_failed=[
            "Threatening immediate cancellation of existing purchase orders (created supplier legal dispute)"
        ],
        final_outcome="Base prices lowered by 15.2%, scrap adder eliminated, quarterly index adjustments instituted",
        tradeoffs="Agreed to purchase standard coil widths to reduce mill scrap",
        lessons_learned="In metal surpluses, moving away from annual fixed contracts to benchmarked index mechanisms lets buyers capture continuous downward price trends without constant renegotiation.",
        date_completed="2024-10-02",
        tags=["Lambda Alloys", "Metals", "Surplus", "CRU Index", "Quarterly Pricing"]
    ),
    CompletedNegotiation(
        id="deal-mu-pcb-013",
        supplier="Mu Circuit Boards",
        category="Electronic Components & Microcontrollers",
        market_conditions="High-density multilayer PCB market balanced; laminate material costs steady, Asian factories competitive.",
        supplier_leverage="Medium (High tooling precision and quick-turn prototype support)",
        buyer_leverage="Medium (Several qualified Taiwanese and domestic PCB fabricators available)",
        supply_balance="balanced",
        supplier_leverage_level="medium",
        buyer_leverage_level="medium",
        urgency="normal",
        alternative_supplier_count=3,
        negotiation_objective="Reduce NRE tooling charges by 50% and secure 10-day prototype quick-turn SLA",
        constraints="16-layer impedance controlled boards require rigorous electrical test verification",
        tactics_attempted=[
            "Tooling cost amortization across production volume",
            "Bundling prototype runs with mass production volume commitments",
            "Demanding free engineering design-for-manufacturing (DFM) reviews"
        ],
        what_worked=[
            "Amortizing NRE tooling over first 10,000 production units, effectively eliminating upfront cash outlay",
            "Bundling quick-turn prototypes with production orders secured 7-day turnaround SLA"
        ],
        what_failed=[
            "Demanding unlimited free engineering revision cycles"
        ],
        final_outcome="Zero upfront tooling charge (amortized), 7-day prototype SLA, 6.8% volume production discount",
        tradeoffs="Committed to sole-sourcing that board design for the first 12 months of production",
        lessons_learned="In balanced high-tech manufacturing, bundling upfront NRE tooling into volume production delivers cash-flow advantages while incentivizing supplier engineering collaboration.",
        date_completed="2024-06-28",
        tags=["Mu Circuit Boards", "PCB", "Electronics", "Balanced", "NRE Amortization"]
    ),
    CompletedNegotiation(
        id="deal-nu-plastics-014",
        supplier="Nu Polymer Injection",
        category="Plastics & Resins",
        market_conditions="Refinery outages caused sudden scarcity in medical-grade polypropylene resin pellets.",
        supplier_leverage="High (Pre-allocated resin resin quotas, competing automotive buyers offering cash premiums)",
        buyer_leverage="Low (Medical device regulatory specs require exact polymer grade with FDA master file)",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=1,
        negotiation_objective="Protect continuity of resin allocation and limit spot surcharge escalation to +10%",
        constraints="Cannot substitute alternate polymer grade without 6-month clinical biocompatibility testing",
        tactics_attempted=[
            "Resin index pass-through formula with 30-day price lag buffer",
            "Joint inventory safety stock agreement",
            "Aggressive price freeze demand"
        ],
        what_worked=[
            "Resin index pass-through formula with mutual 30-day notice buffer",
            "Procurement agreed to pre-fund 60 days of raw resin pellets to guarantee molding machine uptime"
        ],
        what_failed=[
            "Aggressive price freeze demand (supplier immediately offered capacity to competing medical OEM)"
        ],
        final_outcome="Protected 100% of required resin volume; price adjustments limited to verified ICIS resin indices",
        tradeoffs="Pre-funded raw material purchase orders 45 days in advance",
        lessons_learned="In raw material supply shortages with strict regulatory constraints, pre-funding inventory or agreeing to transparent indexed pass-throughs preserves allocation when fixed price demands fail.",
        date_completed="2024-03-02",
        tags=["Nu Plastics", "Plastics", "Shortage", "Regulatory", "Index Pass-Through"]
    ),
    CompletedNegotiation(
        id="deal-xi-consulting-015",
        supplier="Xi Professional Services",
        category="Consulting & Professional Services",
        market_conditions="Enterprise tech consulting market experiencing softening billing rates, increased partner availability.",
        supplier_leverage="Medium (Deep domain knowledge of our legacy ERP architecture)",
        buyer_leverage="Medium (Multiple boutique integration firms eager to bid on transformation projects)",
        supply_balance="balanced",
        supplier_leverage_level="medium",
        buyer_leverage_level="medium",
        urgency="normal",
        alternative_supplier_count=3,
        negotiation_objective="Transition from T&M (Time & Materials) to milestone-based fixed-fee with 15% rate card cut",
        constraints="ERP go-live date is fixed; quality of lead solution architects cannot be compromised",
        tactics_attempted=[
            "Blended rate card benchmarking against regional market averages",
            "Milestone-based fixed fee with 15% holdback linked to acceptance testing",
            "Strict non-billable travel expense policy"
        ],
        what_worked=[
            "Transitioning project phases to milestone-based fixed deliverable pricing with 15% completion holdback",
            "12% reduction in senior partner and solution architect hourly rate cards",
            "Capping reimbursable expenses at 8% of total fee"
        ],
        what_failed=[
            "Demanding full risk-reward outcome billing tied to commercial sales KPIs"
        ],
        final_outcome="Milestone-based contract with 15% holdback, 12% lower blended rate card, $65k in capped travel savings",
        tradeoffs="Agreed to provide 30-day advance schedule notice for project sprints",
        lessons_learned="For professional services, shifting from open-ended T&M to milestone deliverables with holdbacks protects the enterprise from budget creep while establishing transparent accountability.",
        date_completed="2024-08-15",
        tags=["Xi Consulting", "Professional Services", "Milestone Contracts", "Balanced"]
    )
]
