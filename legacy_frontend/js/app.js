// State & Elements
const state = {
  hindsightConnected: false,
  memoryCount: 0,
  allNegotiations: [],
  currentAnalysis: null,
  activeTab: 'tab-advisor',
  retainedThisSession: 0
};

// DOM Elements
const hindsightBadge = document.getElementById('hindsight-status-badge');
const hindsightText = document.getElementById('hindsight-status-text');
const memoryCountBadge = document.getElementById('memory-count-badge');
const tabCountBadge = document.getElementById('tab-count-badge');
const toastContainer = document.getElementById('toast-container');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Forms & Controls
const formAdvisor = document.getElementById('form-advisor');
const formRetain = document.getElementById('form-retain');
const btnRunAnalysis = document.getElementById('btn-run-analysis');
const btnSeed = document.getElementById('btn-seed');
const btnCanonicalDemo = document.getElementById('btn-canonical-demo');
const btnFillAlpha = document.getElementById('btn-fill-alpha');
const btnPrefillRetain = document.getElementById('btn-prefill-retain');
const btnPrefillSurplus = document.getElementById('btn-prefill-surplus-outcome');
const btnRefreshBank = document.getElementById('btn-refresh-bank');
const searchInput = document.getElementById('search-memory');
const memoryGrid = document.getElementById('memory-grid');

// Results elements
const resultsPlaceholder = document.getElementById('results-placeholder');
const resultsContent = document.getElementById('results-content');
const resultsStatus = document.getElementById('results-status');
const warningBox = document.getElementById('warning-box');
const warningText = document.getElementById('warning-text');
const contrastTableBody = document.getElementById('contrast-table-body');
const strategyTitle = document.getElementById('strategy-title');
const strategyRationale = document.getElementById('strategy-rationale');
const recommendedTacticsList = document.getElementById('recommended-tactics-list');
const avoidTacticsList = document.getElementById('avoid-tactics-list');
const strategyTradeoff = document.getElementById('strategy-tradeoff');
const strategyConcession = document.getElementById('strategy-concession');
const recalledList = document.getElementById('recalled-list');

// Hindsight Reflection Evidence elements
const evidenceReasoning = document.getElementById('evidence-strategic-reasoning');
const evidenceDivergence = document.getElementById('evidence-condition-divergence');
const evidenceMemoriesList = document.getElementById('evidence-memories-list');
const evidenceReflectStatus = document.getElementById('evidence-reflect-status');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  checkHealth();
  loadNegotiations();
  setupEventListeners();
  setInterval(checkHealth, 8000);
});

// Tab Switcher
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  tabButtons.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
  if (tabId === 'tab-explorer') {
    renderMemoryGrid(state.allNegotiations);
  }
}

// Event Listeners
function setupEventListeners() {
  // Strategy Advisor Form
  formAdvisor.addEventListener('submit', async (e) => {
    e.preventDefault();
    await runStrategyAnalysis();
  });

  // Retain Form
  formRetain.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitRetainForm();
  });

  // Seed Button
  btnSeed.addEventListener('click', async () => {
    await seedDemoBank();
  });

  // Canonical Demo Button
  btnCanonicalDemo.addEventListener('click', async () => {
    await triggerCanonicalDemo();
  });

  // Fill Alpha Surplus
  btnFillAlpha.addEventListener('click', () => {
    fillAlphaSurplusContext();
  });

  // Pre-fill Retain from Advisor
  btnPrefillRetain.addEventListener('click', () => {
    prefillRetainFromCurrentAdvisor();
    switchTab('tab-retain');
  });

  // Pre-fill Surplus Outcome in Retain tab
  btnPrefillSurplus.addEventListener('click', () => {
    prefillSurplusOutcome();
  });

  // Refresh Memory Bank
  btnRefreshBank.addEventListener('click', () => {
    loadNegotiations();
  });

  // Search in Explorer
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderMemoryGrid(state.allNegotiations);
      return;
    }
    const filtered = state.allNegotiations.filter(deal => {
      return deal.supplier.toLowerCase().includes(q) ||
             deal.category.toLowerCase().includes(q) ||
             deal.market_conditions.toLowerCase().includes(q) ||
             deal.final_outcome.toLowerCase().includes(q) ||
             deal.lessons_learned.toLowerCase().includes(q);
    });
    renderMemoryGrid(filtered);
  });
}

// Update Institutional Memory Summary Bar
function updateMemoryStats() {
  const deals = state.allNegotiations || [];
  const statMemCount = document.getElementById('stat-mem-count');
  const statSuppliersCount = document.getElementById('stat-suppliers-count');
  const statCategoriesCount = document.getElementById('stat-categories-count');
  const statSessionRetained = document.getElementById('stat-session-retained');

  if (statMemCount) statMemCount.textContent = deals.length || state.memoryCount || 0;
  if (statSuppliersCount) statSuppliersCount.textContent = new Set(deals.map(d => d.supplier)).size;
  if (statCategoriesCount) statCategoriesCount.textContent = new Set(deals.map(d => d.category)).size;
  if (statSessionRetained) statSessionRetained.textContent = state.retainedThisSession || 0;
}

// Health Check
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const hindsight = data.hindsight || {};
    
    if (hindsight.status === 'connected') {
      state.hindsightConnected = true;
      hindsightBadge.className = 'status-badge online';
      hindsightText.textContent = `Hindsight Server Live (${hindsight.server_url})`;
    } else {
      state.hindsightConnected = false;
      hindsightBadge.className = 'status-badge replica';
      hindsightText.textContent = `Hindsight Local Replica (Port 8888 Ready)`;
    }

    if (data.memory_bank) {
      state.memoryCount = data.memory_bank.stored_experiences_count || 0;
      memoryCountBadge.textContent = state.memoryCount;
      tabCountBadge.textContent = state.memoryCount;
      updateMemoryStats();
    }
  } catch (err) {
    hindsightBadge.className = 'status-badge';
    hindsightText.textContent = 'Server Offline';
  }
}

// Load All Stored Negotiations
async function loadNegotiations() {
  try {
    const res = await fetch('/api/negotiations');
    const data = await res.json();
    state.allNegotiations = data || [];
    state.memoryCount = state.allNegotiations.length;
    memoryCountBadge.textContent = state.memoryCount;
    tabCountBadge.textContent = state.memoryCount;
    updateMemoryStats();
    if (state.activeTab === 'tab-explorer') {
      renderMemoryGrid(state.allNegotiations);
    }
  } catch (err) {
    console.error('Failed to load negotiations:', err);
  }
}

// Run Condition-Aware Analysis
async function runStrategyAnalysis() {
  const mkt = document.getElementById('adv-market').value.trim().toLowerCase();
  const supLev = document.getElementById('adv-supplier-leverage').value.toLowerCase();
  const buyerLev = document.getElementById('adv-buyer-leverage').value.toLowerCase();
  
  let supplyBalance = 'balanced';
  if (mkt.includes('surplus') || mkt.includes('excess') || mkt.includes('softening')) supplyBalance = 'surplus';
  else if (mkt.includes('shortage') || mkt.includes('tight') || mkt.includes('bottleneck')) supplyBalance = 'shortage';

  const context = {
    supplier: document.getElementById('adv-supplier').value.trim(),
    category: document.getElementById('adv-category').value.trim(),
    market_conditions: document.getElementById('adv-market').value.trim(),
    supplier_leverage: document.getElementById('adv-supplier-leverage').value,
    buyer_leverage: document.getElementById('adv-buyer-leverage').value,
    supply_balance: supplyBalance,
    supplier_leverage_level: supLev.includes('low') ? 'low' : (supLev.includes('high') ? 'high' : 'medium'),
    buyer_leverage_level: buyerLev.includes('high') ? 'high' : (buyerLev.includes('low') ? 'low' : 'medium'),
    urgency: supplyBalance === 'shortage' ? 'urgent' : 'flexible',
    alternative_supplier_count: supplyBalance === 'surplus' ? 4 : (supplyBalance === 'shortage' ? 0 : 2),
    negotiation_objective: document.getElementById('adv-objective').value.trim(),
    constraints: document.getElementById('adv-constraints').value.trim()
  };

  btnRunAnalysis.disabled = true;
  btnRunAnalysis.innerHTML = `<span class="spinner"></span> <span>Running Hindsight Recall & Analysis...</span>`;
  resultsStatus.textContent = 'Analyzing...';
  resultsStatus.className = 'badge badge-warning';

  // Update demo steps
  setStepState(2, 'completed');
  setStepState(3, 'completed');
  setStepState(4, 'active');

  try {
    const res = await fetch('/api/negotiations/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    state.currentAnalysis = data;
    renderAnalysisResults(data);

    setStepState(4, 'completed');
    setStepState(5, 'completed');
    setStepState(6, 'active');

    showToast('Hindsight Memory Recall & Strategy Analysis complete!', 'success');
  } catch (err) {
    showToast(`Analysis failed: ${err.message}`, 'error');
  } finally {
    btnRunAnalysis.disabled = false;
    btnRunAnalysis.innerHTML = `<span>🔍 Run Hindsight Memory Analysis</span>`;
    resultsStatus.textContent = 'Completed';
    resultsStatus.className = 'badge badge-success';
  }
}

// Render Results Cockpit
function renderAnalysisResults(data) {
  resultsPlaceholder.style.display = 'none';
  resultsContent.style.display = 'block';

  // Populate Memory-Grounded Strategy Analysis
  const evidence = data.hindsight_reflection_evidence;
  if (evidence) {
    if (evidenceReasoning) evidenceReasoning.textContent = evidence.strategic_reasoning;
    if (evidenceDivergence) evidenceDivergence.textContent = evidence.condition_divergence;
    if (evidenceReflectStatus) {
      const isLLM = (data.reflection_source === 'hindsight_reflect_llm' || evidence.reflection_source === 'hindsight_reflect_llm');
      if (isLLM) {
        evidenceReflectStatus.textContent = `⚡ Hindsight reflect() [LLM Provider: Groq]`;
        evidenceReflectStatus.className = 'badge badge-success';
      } else {
        evidenceReflectStatus.textContent = `⚠️ Deterministic Fallback [Rule-Based Engine]`;
        evidenceReflectStatus.className = 'badge badge-warning';
      }
    }
    const evidenceSubtitle = document.getElementById('evidence-card-subtitle');
    if (evidenceSubtitle) {
      const isLLM = (data.reflection_source === 'hindsight_reflect_llm' || evidence.reflection_source === 'hindsight_reflect_llm');
      const srcText = isLLM ? 'Hindsight reflect(response_schema=StrategyGuidance, include_facts=True)' : (evidence.source_operation || 'Deterministic Condition Analysis');
      evidenceSubtitle.innerHTML = `Evidence source: <code>${srcText}</code> | Bank: <span class="bank-pill">${evidence.memory_bank_id || 'negotiation-memory'}</span>`;
    }

    if (evidenceMemoriesList) {
      if (evidence.memories_used && evidence.memories_used.length > 0) {
        evidenceMemoriesList.innerHTML = evidence.memories_used.map(m => `
          <div class="evidence-memory-pill">
            <div class="evidence-mem-top">
              <span class="evidence-mem-id">Memory ID: ${m.memory_id}</span>
              ${m.memory_type ? `<span class="badge badge-neutral" style="font-size: 0.7rem; padding: 2px 6px;">Type: ${m.memory_type}</span>` : ''}
              ${m.similarity_score != null ? `<span class="evidence-mem-score">Hindsight Score: ${Math.round(m.similarity_score * 100)}%</span>` : `<span class="evidence-mem-score">Hindsight Precedent</span>`}
            </div>
            ${m.context ? `<div class="evidence-mem-context" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Context: ${m.context}</div>` : ''}
            <div class="evidence-mem-fact">${m.fact_text}</div>
          </div>
        `).join('');
      } else {
        evidenceMemoriesList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem;">No historical memories cited.</div>`;
      }
    }
  }

  const contrast = data.condition_contrast;
  const guidance = data.strategy_guidance;
  const recalled = data.recalled_experiences || [];
  const diff = data.condition_difference;

  // Warning text
  warningText.innerHTML = `<strong>${contrast.leverage_shift_summary}</strong><br><br>${contrast.repeat_warning}`;

  // Table
  contrastTableBody.innerHTML = `
    <tr>
      <td class="dim-col">Market Conditions</td>
      <td class="past-col">${contrast.past_conditions}</td>
      <td class="cur-col">${contrast.current_conditions}</td>
    </tr>
    <tr>
      <td class="dim-col">Supplier Leverage</td>
      <td class="past-col"><span class="badge badge-warning">${contrast.past_supplier_leverage}</span></td>
      <td class="cur-col"><span class="badge badge-success">${contrast.current_supplier_leverage}</span></td>
    </tr>
    <tr>
      <td class="dim-col">Buyer Leverage</td>
      <td class="past-col"><span class="badge badge-neutral">${contrast.past_buyer_leverage}</span></td>
      <td class="cur-col"><span class="badge badge-success">${contrast.current_buyer_leverage}</span></td>
    </tr>
    ${diff ? `
    <tr>
      <td class="dim-col">Condition Difference</td>
      <td colspan="2" style="background: rgba(14, 165, 233, 0.12); color: #7dd3fc; font-weight: 500;">
        <strong>Shift Summary:</strong> ${diff.summary} (${diff.supply_balance_shift}, SupLev: ${diff.supplier_leverage_shift}, BuyerLev: ${diff.buyer_leverage_shift})
      </td>
    </tr>
    ` : ''}
    <tr>
      <td class="dim-col">Strategic Shift</td>
      <td colspan="2" style="background: rgba(56, 189, 248, 0.08); color: #bae6fd; font-weight: 500;">
        ${contrast.recommended_pivot}
      </td>
    </tr>
  `;

  // Strategy block
  strategyTitle.textContent = `🎯 ${guidance.recommendation || guidance.tactical_recommendation}`;
  strategyRationale.textContent = guidance.rationale;
  strategyTradeoff.textContent = guidance.key_tradeoff_guidance || guidance.concession_strategy || '';
  strategyConcession.textContent = guidance.concession_strategy || '';

  // Recommended Tactics
  const tactics = guidance.tactics || guidance.recommended_tactics || [];
  recommendedTacticsList.innerHTML = tactics.map(t => `
    <div class="tactic-item positive">
      <span class="tactic-icon">✓</span>
      <span>${t}</span>
    </div>
  `).join('');

  // Tactics to Avoid
  const avoidTactics = guidance.tactics_to_avoid || [];
  avoidTacticsList.innerHTML = avoidTactics.map(t => `
    <div class="tactic-item negative">
      <span class="tactic-icon">✕</span>
      <span>${t}</span>
    </div>
  `).join('');

  // Display Risks
  const risksBox = document.getElementById('strategy-risks-box');
  const risksList = document.getElementById('strategy-risks-list');
  if (risksBox && risksList) {
    if (guidance.risks && guidance.risks.length > 0) {
      risksBox.style.display = 'block';
      risksList.innerHTML = guidance.risks.map(r => `<li>${r}</li>`).join('');
    } else {
      risksBox.style.display = 'none';
    }
  }

  // 1. Why This Strategy Changed
  const primaryDeal = (recalled[0] && recalled[0].structured_negotiation) ? recalled[0].structured_negotiation : null;
  const whyMarketShift = document.getElementById('why-market-shift');
  const whySupplierShift = document.getElementById('why-supplier-leverage-shift');
  const whyBuyerShift = document.getElementById('why-buyer-leverage-shift');
  const whyAlternativesShift = document.getElementById('why-alternatives-shift');
  const whyHistoricalTactic = document.getElementById('why-historical-tactic');

  if (whyMarketShift) {
    whyMarketShift.innerHTML = `<span class="why-shift-past">${contrast.past_conditions}</span> <span class="why-shift-arrow">➔</span> <span class="why-shift-cur">${contrast.current_conditions}</span>`;
  }
  if (whySupplierShift) {
    whySupplierShift.innerHTML = `<span class="why-shift-past">${contrast.past_supplier_leverage}</span> <span class="why-shift-arrow">➔</span> <span class="why-shift-cur">${contrast.current_supplier_leverage}</span>`;
  }
  if (whyBuyerShift) {
    whyBuyerShift.innerHTML = `<span class="why-shift-past">${contrast.past_buyer_leverage}</span> <span class="why-shift-arrow">➔</span> <span class="why-shift-cur">${contrast.current_buyer_leverage}</span>`;
  }
  if (whyAlternativesShift) {
    const pastAlts = (primaryDeal && primaryDeal.constraints && primaryDeal.constraints.toLowerCase().includes('single')) ? 'Single source / No approved alternates' : 'Sole source / 0 alternatives';
    const curAlts = (data.query_context.market_conditions.includes('alternative') || data.query_context.market_conditions.includes('vendor')) ? '4 qualified alternative vendors available' : 'Multiple alternates available';
    whyAlternativesShift.innerHTML = `<span class="why-shift-past">${pastAlts}</span> <span class="why-shift-arrow">➔</span> <span class="why-shift-cur">${curAlts}</span>`;
  }
  if (whyHistoricalTactic) {
    const histTactic = (primaryDeal && primaryDeal.what_worked && primaryDeal.what_worked.length > 0) ? primaryDeal.what_worked.join('; ') : ((primaryDeal && primaryDeal.tactics_attempted) ? primaryDeal.tactics_attempted.join('; ') : 'Multi-year 85% volume commitment with take-or-pay guarantee');
    whyHistoricalTactic.textContent = histTactic;
  }

  // 2. Negotiation Intelligence Timeline
  const timelineTrack = document.getElementById('timeline-track');
  const timelineSupplierBadge = document.getElementById('timeline-supplier-badge');
  if (timelineSupplierBadge) {
    timelineSupplierBadge.textContent = data.query_context.supplier;
  }
  if (timelineTrack) {
    const pastSupplierName = primaryDeal ? primaryDeal.supplier : data.query_context.supplier;
    const pastDate = primaryDeal ? (primaryDeal.date_completed || 'Historical Precedent') : 'Historical Deal';
    const pastConditionsText = primaryDeal ? primaryDeal.market_conditions : contrast.past_conditions;
    const pastTacticText = (primaryDeal && primaryDeal.what_worked && primaryDeal.what_worked.length > 0) ? primaryDeal.what_worked[0] : '85% volume commitment';
    const pastOutcomeText = primaryDeal ? primaryDeal.final_outcome : 'Secured 12% discount & allocation';

    // Check if new outcome already exists in state for this supplier in surplus
    const retainedNewDeal = (state.allNegotiations || []).find(d => 
      d.supplier.toLowerCase() === data.query_context.supplier.toLowerCase() &&
      d.id !== (primaryDeal ? primaryDeal.id : null) &&
      d.market_conditions.toLowerCase().includes('surplus')
    );

    timelineTrack.innerHTML = `
      <div class="timeline-node completed">
        <div class="timeline-node-header">
          <span class="timeline-node-title">1. Historical Negotiation (${pastDate})</span>
          <span class="badge badge-neutral" style="font-size: 0.7rem;">${pastSupplierName}</span>
        </div>
        <div class="timeline-node-body">Precedent recorded in Hindsight bank <code>negotiation-memory</code>.</div>
      </div>

      <div class="timeline-node completed">
        <div class="timeline-node-header">
          <span class="timeline-node-title">2. Historical Conditions</span>
          <span class="badge badge-warning" style="font-size: 0.7rem;">Supplier Leverage: ${contrast.past_supplier_leverage}</span>
        </div>
        <div class="timeline-node-body">${pastConditionsText}</div>
      </div>

      <div class="timeline-node completed">
        <div class="timeline-node-header">
          <span class="timeline-node-title">3. Historical Tactic Deployed</span>
        </div>
        <div class="timeline-node-body">${pastTacticText}</div>
      </div>

      <div class="timeline-node completed">
        <div class="timeline-node-header">
          <span class="timeline-node-title">4. Historical Settlement Outcome</span>
        </div>
        <div class="timeline-node-body">${pastOutcomeText}</div>
      </div>

      <div class="timeline-node highlight">
        <div class="timeline-node-header">
          <span class="timeline-node-title">5. Current Negotiation Context (Upcoming)</span>
          <span class="badge badge-success" style="font-size: 0.7rem;">Buyer Leverage: ${contrast.current_buyer_leverage}</span>
        </div>
        <div class="timeline-node-body">${data.query_context.market_conditions}</div>
      </div>

      <div class="timeline-node highlight">
        <div class="timeline-node-header">
          <span class="timeline-node-title">6. Memory-Grounded Strategy Analysis</span>
          <span class="badge badge-cyan" style="font-size: 0.7rem;">${evidence && evidence.provenance === 'hindsight_reflect_success' ? 'Hindsight.reflect()' : 'Condition Analysis'}</span>
        </div>
        <div class="timeline-node-body">${guidance.tactical_recommendation} — Pivot away from past volume lock-in.</div>
      </div>

      <div class="timeline-node">
        <div class="timeline-node-header">
          <span class="timeline-node-title">7. Human Procurement Decision</span>
          <span class="badge badge-neutral" style="font-size: 0.7rem;">Human Authority</span>
        </div>
        <div class="timeline-node-body">${data.human_in_the_loop_advisory}</div>
      </div>

      <div class="timeline-node ${retainedNewDeal ? 'completed' : ''}">
        <div class="timeline-node-header">
          <span class="timeline-node-title">8. Retained Institutional Learning</span>
          <span class="badge ${retainedNewDeal ? 'badge-success' : 'badge-neutral'}" style="font-size: 0.7rem;">${retainedNewDeal ? 'Persisted into Memory Bank' : 'Awaiting Deal Settlement'}</span>
        </div>
        <div class="timeline-node-body">${retainedNewDeal ? retainedNewDeal.final_outcome : 'Conclude negotiation and click "Retain Outcome" to permanently update Hindsight for future managers.'}</div>
      </div>
    `;
  }

  // Recalled Experiences List
  if (recalled.length === 0) {
    recalledList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.82rem;">No previous negotiation found in Hindsight bank.</div>`;
  } else {
    recalledList.innerHTML = recalled.map(r => {
      const deal = r.structured_negotiation;
      const score = r.relevance_score ? Math.round(r.relevance_score * 100) : 95;
      return `
        <div class="experience-card">
          <div class="exp-header">
            <span class="exp-title">${deal ? deal.supplier : 'Past Experience'} • ${deal ? deal.category : ''}</span>
            <span class="exp-score">Hindsight Match: ${score}%</span>
          </div>
          <div class="exp-grid">
            <div class="exp-field"><span class="field-label">Past Conditions:</span>${deal ? deal.market_conditions : r.text.substring(0, 100)}</div>
            <div class="exp-field"><span class="field-label">Supplier Leverage:</span>${deal ? deal.supplier_leverage : 'N/A'}</div>
            <div class="exp-field"><span class="field-label">Tactics Used:</span>${deal ? deal.tactics_attempted.join(', ') : 'N/A'}</div>
            <div class="exp-field"><span class="field-label">What Worked:</span><strong style="color: #6ee7b7;">${deal ? deal.what_worked.join(', ') : 'N/A'}</strong></div>
          </div>
          <div class="exp-outcome">
            <strong>Outcome Achieved:</strong> ${deal ? deal.final_outcome : 'Settled'}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Retain Completed Negotiation Outcome
async function submitRetainForm() {
  const btn = document.getElementById('btn-submit-retain');
  const payload = {
    supplier: document.getElementById('ret-supplier').value.trim(),
    category: document.getElementById('ret-category').value.trim(),
    market_conditions: document.getElementById('ret-market').value.trim(),
    supplier_leverage: document.getElementById('ret-sup-leverage').value.trim(),
    buyer_leverage: document.getElementById('ret-buy-leverage').value.trim(),
    negotiation_objective: document.getElementById('ret-objective').value.trim(),
    constraints: document.getElementById('ret-constraints').value.trim(),
    tactics_attempted: document.getElementById('ret-tactics').value.split(',').map(s => s.trim()).filter(Boolean),
    what_worked: document.getElementById('ret-what-worked').value.split(',').map(s => s.trim()).filter(Boolean),
    what_failed: document.getElementById('ret-what-failed').value.split(',').map(s => s.trim()).filter(Boolean),
    final_outcome: document.getElementById('ret-outcome').value.trim(),
    tradeoffs: document.getElementById('ret-tradeoffs').value.trim(),
    lessons_learned: document.getElementById('ret-lessons').value.trim()
  };

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> <span>Retaining in Hindsight...</span>`;

  try {
    const res = await fetch('/api/negotiations/retain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Retain failed');

    showToast(`Outcome successfully retained into Hindsight memory bank!`, 'success');
    
    // Update session counter & stats
    state.retainedThisSession = (state.retainedThisSession || 0) + 1;
    updateMemoryStats();

    // Update step tracker
    setStepState(6, 'completed');
    setStepState(7, 'completed');

    await loadNegotiations();
    switchTab('tab-explorer');
  } catch (err) {
    showToast(`Retain error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>💾 Retain into Hindsight</span>`;
  }
}

// Render Memory Grid in Explorer Tab
function renderMemoryGrid(deals) {
  if (!deals || deals.length === 0) {
    memoryGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">📭</div>
        <h4>No negotiations in memory bank</h4>
        <p>Click "Seed Demo Bank" to populate the initial canonical negotiation experiences.</p>
      </div>
    `;
    return;
  }

  memoryGrid.innerHTML = deals.map(deal => `
    <div class="memory-card">
      <div class="mem-card-top">
        <div>
          <div class="mem-supplier">${deal.supplier}</div>
          <div class="mem-category">${deal.category}</div>
        </div>
        <span class="mem-date">${deal.date_completed || 'Archived'}</span>
      </div>

      <div class="mem-badge-row">
        <span class="badge ${deal.supplier_leverage.toLowerCase().includes('high') ? 'badge-warning' : 'badge-neutral'}">
          Sup Lev: ${deal.supplier_leverage.split(' ')[0]}
        </span>
        <span class="badge ${deal.buyer_leverage.toLowerCase().includes('high') ? 'badge-success' : 'badge-neutral'}">
          Buy Lev: ${deal.buyer_leverage.split(' ')[0]}
        </span>
      </div>

      <div class="mem-body">
        <div><strong style="color: var(--text-primary);">Conditions:</strong> ${deal.market_conditions}</div>
        <div class="mem-pill-box">
          <div style="color: #6ee7b7; font-size: 0.78rem;">
            <strong>✓ Worked:</strong> ${deal.what_worked.join('; ')}
          </div>
          ${deal.what_failed && deal.what_failed.length > 0 ? `
            <div style="color: #fca5a5; font-size: 0.78rem; margin-top: 3px;">
              <strong>✕ Failed:</strong> ${deal.what_failed.join('; ')}
            </div>
          ` : ''}
        </div>
        <div class="exp-outcome" style="margin-top: 2px;">
          <strong>Final Outcome:</strong> ${deal.final_outcome}
        </div>
        <div class="mem-lessons">
          <strong>Institutional Wisdom:</strong> ${deal.lessons_learned}
        </div>
      </div>
    </div>
  `).join('');
}

// Seed Demo Bank
async function seedDemoBank() {
  btnSeed.disabled = true;
  btnSeed.innerHTML = `<span class="spinner"></span> <span>Seeding...</span>`;
  try {
    const res = await fetch('/api/negotiations/seed', { method: 'POST' });
    const data = await res.json();
    showToast(data.message || 'Canonical demo data seeded!', 'success');
    await loadNegotiations();
  } catch (err) {
    showToast(`Seed failed: ${err.message}`, 'error');
  } finally {
    btnSeed.disabled = false;
    btnSeed.innerHTML = `<span>🌱 Seed Demo Bank</span>`;
  }
}

// Canonical Demo Flow
async function triggerCanonicalDemo() {
  fillAlphaSurplusContext();
  switchTab('tab-advisor');
  showToast('Canonical Alpha Supplier Case loaded. Running Memory Analysis...', 'success');
  await runStrategyAnalysis();
}

// Helper: Fill Alpha Surplus Case into Advisor Form
function fillAlphaSurplusContext() {
  document.getElementById('adv-supplier').value = "Alpha Supplier";
  document.getElementById('adv-category').value = "Raw Materials";
  document.getElementById('adv-market').value = "Supply surplus, softening global industrial demand, 4 alternative qualified vendors available.";
  document.getElementById('adv-supplier-leverage').value = "Low";
  document.getElementById('adv-buyer-leverage').value = "High";
  document.getElementById('adv-objective').value = "Achieve 15% price reduction, eliminate volume take-or-pay lock-in, and switch to quarterly price reviews.";
  document.getElementById('adv-constraints').value = "Delivery lead time cannot exceed 14 business days.";
}

// Helper: Pre-fill Retain from Advisor
function prefillRetainFromCurrentAdvisor() {
  document.getElementById('ret-supplier').value = document.getElementById('adv-supplier').value;
  document.getElementById('ret-category').value = document.getElementById('adv-category').value;
  document.getElementById('ret-market').value = document.getElementById('adv-market').value;
  document.getElementById('ret-sup-leverage').value = document.getElementById('adv-supplier-leverage').value;
  document.getElementById('ret-buy-leverage').value = document.getElementById('adv-buyer-leverage').value;
  document.getElementById('ret-objective').value = document.getElementById('adv-objective').value;
  document.getElementById('ret-constraints').value = document.getElementById('adv-constraints').value;
  document.getElementById('ret-tactics').value = "Competitive benchmarking mini-RFP, refusal of volume exclusivity, index-linked price ratchet";
  document.getElementById('ret-what-worked').value = "Competitive bidding trial with 2 second-source suppliers, index-linked price adjustments";
  document.getElementById('ret-what-failed').value = "Demanding Net 120 payment terms (settled at Net 60)";
  document.getElementById('ret-outcome').value = "Achieved 16% unit cost reduction, 0% exclusivity lock-in, quarterly market adjustments, Net 60 terms.";
  document.getElementById('ret-tradeoffs').value = "Offered first-look consideration on new product lines in exchange for deep price cut.";
  document.getElementById('ret-lessons').value = "In surplus conditions with multiple alternatives, competitive benchmarking is the winning currency. Volume lock-ins must be refused to maintain market flexibility.";
}

// Helper: Pre-fill Surplus Outcome in Retain Tab
function prefillSurplusOutcome() {
  fillAlphaSurplusContext();
  prefillRetainFromCurrentAdvisor();
  showToast('Alpha Supplier surplus outcome prefilled. Ready to retain!', 'success');
}

// Helper: Set Step Tracker Visual State
function setStepState(stepNum, status) {
  const el = document.getElementById(`step-1`);
  for (let i = 1; i <= 7; i++) {
    const s = document.getElementById(`step-${i}`);
    if (!s) continue;
    if (i < stepNum) {
      s.className = 'step-chip completed';
    } else if (i === stepNum) {
      s.className = `step-chip ${status}`;
    }
  }
}

// Helper: Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
