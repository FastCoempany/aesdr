# AESDR Pricing Engine — Technical Specification

## Overview

A computational pricing model that generates optimal price points for AESDR's three tiers (SDR Individual, AE Individual, Team) using synthetic market simulation calibrated against real public data. Combines Bayesian conjoint analysis, multi-objective optimization, and game-theoretic mechanism design.

**Output:** Price recommendations with 90% confidence intervals, sensitivity analysis, and scenario modeling.

---

## Phase 0: Data Reality Check

| Source | Access | Cost | Method |
|--------|--------|------|--------|
| **BLS** | Free API | $0 | REST API v2.0, SOC codes 41-3091 (SDR), 41-4011 (AE) |
| **ProfitWell/Paddle** | Free | $0 | API integration, benchmark reports |
| **Glassdoor** | Paywalled | ~$1–3/run via Apify | Scraper actor, salary + reviews |
| **Levels.fyi** | Paywalled | ~$1–2/run via Apify | Apify scraper or manual CSV |
| **Repvue** | Semi-free | $0 (manual) | Browse + manual extraction (no API) |
| **G2/TrustRadius** | Paywalled | ~$1–3/run via Apify | Scraper actors for competitor reviews |
| **Udemy/Coursera** | Paywalled | ~$1–3/run via Apify | Course pricing, ratings, enrollment counts |
| **LinkedIn** | Enterprise only | $800+/mo | **Skip.** Proxy via BLS tenure data + Repvue |
| **SaaStr/Pavilion/RevGenius** | Membership-gated | $0-$500 | **Proxy via** published annual reports (free PDFs) |
| **Stripe benchmarks** | Your own Stripe | $0 | Your own Stripe dashboard data |

**Total hard cost: ~$0–$25 one-time.** Apify free tier ($5/mo credits) covers all scrapers — you run each 1–3 times during data collection, not recurring. BLS + ProfitWell + Repvue (manual) + published reports are free and cover 70% of critical inputs.

---

## Phase 1: Data Collection Pipeline

**Duration: 5–7 days**

### 1A — BLS Occupational Data (free, legal, robust)

```
Endpoint: https://api.bls.gov/publicAPI/v2/timeseries/data/
Series needed:
  - OEUM003300041309100000013  (SDR median wage by metro)
  - OEUM003300041401100000013  (AE median wage by metro)
  - Occupational Employment & Wage Statistics (OEWS) full dataset
```

**What we extract:**
- Wage percentiles (10th, 25th, 50th, 75th, 90th) for SDRs and AEs
- Geographic distribution (metro area breakdown)
- Employment counts (total addressable market sizing)
- Year-over-year wage growth (income trajectory = urgency signal)

**Output:** `bls_compensation.parquet` — ~400K records, wage distributions by role × geography × percentile

### 1B — Glassdoor/Levels.fyi Compensation (supplements BLS with OTE data)

BLS reports base salary only. Sales comp is OTE (base + commission). We need the commission multiplier.

**What we scrape:**
- Job title: "SDR", "BDR", "Account Executive", "Inside Sales"
- Filters: company size, industry (SaaS/tech), geography
- Fields: base, commission/bonus, total comp, years experience

**Output:** `ote_distributions.parquet` — OTE by role × YOE × company_stage

**Fallback if scraping is too expensive:** Use published compensation reports from Bravado, Bridge Group, Pavilion (annual PDFs, free to download). Manual extraction into CSV. These are survey-based with 500–2000 respondents each.

### 1C — Repvue Company + Role Data (manual, free)

**What we extract (browsing + copy):**
- Company ratings for sales orgs
- Average quota attainment percentages (critical — tells us what % of reps are actually hitting numbers)
- Culture scores (proxy for training investment)
- Comp ranges by company tier

**Output:** `repvue_companies.csv` — ~200–300 companies with quota attainment, culture scores, comp ranges

### 1D — Competitor Pricing & Feature Matrix (G2 + TrustRadius + manual)

**Competitors to profile:**

| Product | Price | Model | Features |
|---------|-------|-------|----------|
| Aspireship | Free (employer-paid) | Marketplace | Video courses, job placement |
| CourseCareers | ~$500 | One-time | Video courses, certification |
| Pavilion | ~$2K/yr | Membership | Community, courses, events |
| Sandler Training | $2–5K | Workshop | In-person, methodology |
| JBarrows | ~$500/yr | Subscription | Video, live sessions |
| Winning by Design | $1–3K | Workshop | Frameworks, certification |
| MEDDIC training (various) | $500–2K | Various | Methodology-specific |
| Udemy sales courses | $15–200 | One-time | Video, certificates |
| LinkedIn Learning | $30/mo | Subscription | Video library |

**From G2/TrustRadius we extract:**
- Star ratings, review count (social proof strength)
- Sentiment analysis on reviews (what do people praise vs complain about?)
- Feature comparison matrices
- Buyer segment breakdown (who's actually buying — individuals vs managers?)

**Output:** `competitor_matrix.csv` + `competitor_reviews.jsonl`

### 1E — Course Marketplace Revealed Preference Data (Udemy/Coursera)

**What we scrape:**
- All courses tagged "sales training", "SDR training", "B2B sales", "SaaS sales"
- Fields: price, original price (discount signal), enrollment count, rating, review count, last updated, instructor credentials, curriculum length

**Why this matters:** Enrollment count × price = revealed willingness-to-pay at scale. A course with 50,000 enrollments at $20 tells you something different than one with 500 enrollments at $500.

**Output:** `marketplace_courses.parquet` — ~2,000–5,000 courses with pricing + enrollment

### 1F — Industry Benchmark Reports (free PDFs)

**Sources:**
- Bridge Group annual SDR metrics report (free)
- Pavilion annual compensation survey (free PDF)
- SaaStr annual survey data (published blog posts)
- RevGenius state of sales report
- Gartner/Forrester sales training market sizing (executive summaries free)

**What we extract:**
- Average L&D spend per rep ($500–$1,500/yr cited across sources)
- Self-directed vs company-funded training split
- Training format preferences (video vs live vs hybrid)
- Career tenure by role (average months as SDR before promotion/attrition)
- Quota attainment distributions (typically ~40–60% of reps hit quota)

**Output:** `industry_benchmarks.json` — curated parameter file

---

## Phase 2: Data Processing & Parameter Calibration

**Duration: 3–4 days**

### 2A — Compensation Distribution Fitting

```python
# Fit parametric distributions to OTE data
# SDR OTE is approximately lognormal
# AE OTE is approximately lognormal with heavier right tail

from scipy import stats

sdr_ote_params = stats.lognorm.fit(sdr_ote_data)  # (shape, loc, scale)
ae_ote_params = stats.lognorm.fit(ae_ote_data)

# Validate with K-S test against BLS data
# Cross-reference: median SDR OTE ~$55-75K, median AE OTE ~$100-150K
```

**Output:** Calibrated distribution parameters for OTE by role × geography × company_stage

### 2B — Price Sensitivity Function Estimation

This is the core model input. Price sensitivity = f(income, role, urgency, alternatives_awareness).

**Sources feeding this:**
- OTE data → income (from 2A)
- Udemy enrollment × price curves → revealed elasticity at low price points
- Competitor pricing → reference price anchors
- BLS tenure data → urgency proxy (shorter tenure = newer to role = higher urgency)
- Quota attainment data from Repvue → performance anxiety multiplier

**The function:**

```
WTP_i = base_wtp(role_i)
        × income_multiplier(ote_i / median_ote)
        × urgency_multiplier(months_in_role_i)
        × quality_signal(price)  # sigmoid — too cheap = skepticism
        × competitor_adjustment(awareness_i, alternatives_i)
        × L&D_budget_ceiling(company_funded_i)
```

Each component is calibrated from real data:
- `base_wtp(SDR)` seeded from Udemy/CourseCareers revealed preference data
- `income_multiplier` — from economics literature, training spend is ~0.5–2% of income
- `urgency_multiplier` — calibrated from Bridge Group tenure data (median SDR tenure ~15 months)
- `quality_signal` — sigmoid with inflection at ~$150 (where "cheap course" perception flips to "real investment")

### 2C — Competitor Response Model

```python
# Static competitive landscape (competitors won't change price in response to AESDR)
# Model as: for each competitor, what's the substitution probability?

substitution_matrix = {
    'aspireship':    {'prob_aware': 0.3, 'prob_substitute': 0.4, 'price': 0},
    'coursecareers': {'prob_aware': 0.2, 'prob_substitute': 0.3, 'price': 500},
    'udemy_generic':  {'prob_aware': 0.7, 'prob_substitute': 0.15, 'price': 20},
    'do_nothing':    {'prob_aware': 1.0, 'prob_substitute': 0.5, 'price': 0},
    # "do nothing" is always the strongest competitor
}
```

### 2D — Refund Rate Model

From ProfitWell/Paddle benchmarks + your own Stripe data (once you have it):

```
refund_rate = f(price, segment)
# Typically: higher price → lower refund rate (more committed buyers)
# But with inflection — too high and refund rate spikes
# Education products: ~5-12% refund rate at $100-500 range
# 14-day window: ~60-70% of all refunds happen in first 3 days
```

---

## Phase 3: Synthetic Respondent Generation (Monte Carlo Engine)

**Duration: 3–4 days**

### 3A — Respondent Archetype Definitions

Each synthetic respondent is a vector sampled from calibrated distributions:

```python
@dataclass
class SyntheticRespondent:
    # Demographics (from BLS + Glassdoor)
    role: Literal['SDR', 'AE']
    ote: float                    # sampled from lognormal
    yoe: float                    # sampled from geometric
    company_stage: str            # categorical: startup/mid/enterprise
    geography: str                # metro area, affects CoL adjustment

    # Behavioral (from Repvue + Bridge Group + marketplace data)
    quota_attainment: float       # beta distribution, calibrated from Repvue
    months_in_current_role: int   # geometric, from BLS tenure data
    prior_training_spend: float   # mixture model from survey data
    num_competitors_aware_of: int # poisson, from market research

    # Psychographic (derived)
    urgency: float                # f(months_in_role, quota_attainment)
    price_sensitivity: float      # f(ote, geography_col, company_funded)
    quality_skepticism: float     # f(prior_training_spend, num_competitors_aware)
    company_will_reimburse: bool  # bernoulli(p=f(company_stage))

    # Computed
    wtp: float                    # willingness to pay, from Phase 2B function
    purchase_probability: float   # f(wtp, actual_price) — logistic
```

### 3B — Population Sampling

```python
def generate_population(n=10000, seed=42):
    """
    Generate n synthetic respondents from calibrated distributions.
    Correlations between variables are preserved via copula.
    """
    # Role split: ~55% SDR, 45% AE (from BLS employment counts)
    # Within SDR: OTE ~ lognorm(mu=10.9, sigma=0.25) → median ~$60K
    # Within AE:  OTE ~ lognorm(mu=11.4, sigma=0.35) → median ~$120K

    # Use Gaussian copula to preserve correlations:
    # - OTE ↔ company_stage: r=0.45 (enterprise pays more)
    # - YOE ↔ OTE: r=0.55 (experience → higher comp)
    # - company_stage ↔ reimburse: r=0.60 (enterprise more likely to fund)
    # - quota_attainment ↔ urgency: r=-0.70 (missing quota → desperate)

    # Correlation matrix calibrated from cross-referencing
    # BLS × Repvue × Bridge Group data
```

### 3C — Choice Simulation

For each respondent, simulate their decision at each price point:

```python
def simulate_choice(respondent, individual_price, team_price):
    """
    Returns: 'buy_individual', 'buy_team', 'buy_competitor', 'do_nothing'
    """
    # Utility of AESDR individual
    u_individual = (
        respondent.wtp
        - individual_price
        + quality_perception(individual_price)
        + brand_value  # calibrated from market positioning
        + feature_value(respondent.role)
        + noise  # Gumbel-distributed (gives us logit model)
    )

    # Utility of AESDR team (only if company_will_reimburse)
    u_team = (
        respondent.wtp * 0.3  # individual share of team value
        - (team_price / team_size_estimate)
        + team_premium  # dashboard, shared progress
        + noise
    ) if respondent.company_will_reimburse else -inf

    # Utility of best outside option
    u_outside = max(
        utility_competitor(c, respondent)
        for c in competitors
        if aware(respondent, c)
    )

    # Utility of do nothing
    u_nothing = 0 + noise  # normalized baseline

    # Multinomial logit choice
    return argmax(u_individual, u_team, u_outside, u_nothing)
```

---

## Phase 4: Pricing Models

**Duration: 5–7 days**

### 4A — Bayesian Conjoint (Method 1)

**What it does:** Reverse-engineers willingness-to-pay from simulated purchase decisions rather than asking people directly (people lie about what they'd pay).

```python
# Hierarchical Bayesian multinomial logit
# Uses PyMC or Stan

import pymc as pm

with pm.Model() as conjoint_model:
    # Population-level parameters
    mu_beta = pm.Normal('mu_beta', mu=0, sigma=2, shape=n_features)
    sigma_beta = pm.HalfNormal('sigma_beta', sigma=1, shape=n_features)

    # Individual-level part-worths (hierarchical)
    beta_i = pm.Normal('beta_i', mu=mu_beta, sigma=sigma_beta,
                        shape=(n_respondents, n_features))

    # Features: [price, n_lessons, has_tools, has_discord,
    #            has_updates, brand_quality, refund_guarantee]

    # Likelihood
    utility = pm.math.dot(X, beta_i.T)  # X = feature matrix
    choice_prob = pm.math.softmax(utility, axis=0)
    observed = pm.Categorical('choice', p=choice_prob, observed=choices)

    # MCMC sampling
    trace = pm.sample(2000, tune=1000, cores=4)

# Extract: posterior distribution of WTP per segment
# WTP = -beta_price_feature / beta_other_features
```

**Critical inputs:**
- Price points to test (at least 5–7 levels)
- Feature bundles to decompose (lessons, tools, Discord, updates, team dashboard)
- Minimum 200–300 choice observations per segment for stable posteriors
- Prior distributions on price sensitivity (can use industry benchmarks from similar ed-tech/SaaS training products)

### 4B — Multi-Objective Optimization (Method 2)

**What it does:** Simultaneously maximizes revenue, conversion rate, and LTV while respecting constraints (market positioning, refund rate ceiling, competitive floor).

```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.core.problem import Problem

class PricingProblem(Problem):
    def __init__(self, population, competitors):
        # Decision variables: [sdr_price, ae_price, team_price]
        super().__init__(
            n_var=3,
            n_obj=3,  # revenue, conversion_rate, ltv
            n_constr=5,
            xl=[29, 49, 199],    # price floors
            xu=[499, 799, 2999]  # price ceilings
        )

    def _evaluate(self, X, out):
        revenue = []
        conversion = []
        ltv = []

        for prices in X:
            sdr_p, ae_p, team_p = prices

            # Simulate market at these prices
            choices = [simulate_choice(r,
                         sdr_p if r.role == 'SDR' else ae_p,
                         team_p)
                      for r in self.population]

            # Compute objectives
            rev = sum(sdr_p * (c == 'buy_individual' and r.role == 'SDR')
                     + ae_p * (c == 'buy_individual' and r.role == 'AE')
                     + team_p * (c == 'buy_team')
                     for r, c in zip(self.population, choices))

            conv = sum(1 for c in choices if c.startswith('buy')) / len(choices)

            # LTV includes referral probability + upsell
            lifetime = rev * (1 + referral_coefficient * conv)

            revenue.append(-rev)       # negative because pymoo minimizes
            conversion.append(-conv)
            ltv.append(-lifetime)

        out["F"] = np.column_stack([revenue, conversion, ltv])

        # Constraints
        out["G"] = np.column_stack([
            X[:, 2] - X[:, 0] * 8,    # team < 8x individual SDR
            X[:, 0] * 3 - X[:, 2],    # team > 3x individual SDR
            X[:, 0] - X[:, 1],         # SDR price <= AE price
            0.08 - refund_rate(X),     # refund rate < 8%
            cac - X[:, 0] * conv_rate  # unit economics positive
        ])

# Solve
algorithm = NSGA2(pop_size=200)
result = minimize(PricingProblem(population, competitors),
                  algorithm, ('n_gen', 500))

# Output: Pareto frontier of (SDR_price, AE_price, team_price) triples
```

**Critical inputs:**
- Conversion rate at 2+ price points (even educated guesses to seed the model)
- Traffic volume and source mix (organic vs paid — different intent = different elasticity)
- OTE distributions for AEs vs SDRs by market (Bureau of Labor Stats + Repvue + Glassdoor data)
- Competitor pricing grid with feature comparison
- Your target margin and growth rate

### 4C — Game-Theoretic Screening (Method 3)

**What it does:** Models the strategic interaction between you, competitors, and buyer segments — accounts for the fact that pricing isn't a vacuum, it's a game.

```python
# Mechanism design: ensure incentive compatibility
# A team buyer should never prefer buying N individual seats

def incentive_compatible(individual_price, team_price, max_seats=10):
    """
    Team pricing must satisfy:
    team_price < individual_price * max_seats  (team is a deal)
    team_price > individual_price * 3          (can't just buy 3 singles)
    team_price / max_seats > individual_price * 0.5  (per-seat isn't absurdly cheap)
    """
    return (individual_price * 3 < team_price < individual_price * max_seats
            and team_price / max_seats > individual_price * 0.5)

# Signaling equilibrium: price as quality signal
def quality_signal_equilibrium(price, segment):
    """
    Spence signaling model adapted:
    - Below $50: "guru garbage" zone — buyers assume low quality
    - $50-$150: "maybe legit" — uncertain quality perception
    - $150-$500: "serious investment" — positive quality signal
    - Above $500: "enterprise/corporate" — individual buyers balk

    Inflection point calibrated from Udemy/CourseCareers enrollment curves
    """
    perception = sigmoid(price, midpoint=150, steepness=0.03)
    sticker_shock = 1 - sigmoid(price, midpoint=400, steepness=0.02)
    return perception * sticker_shock
```

**Critical inputs:**
- Competitor response functions (if you price at X, what do they do? Static or dynamic?)
- Buyer belief priors about course quality as a function of price
- The ratio: team_price / (individual_price × seats) — this is the screening lever
- Outside option value: what does "do nothing" cost the buyer? (missed quota × months × commission rate = implicit cost of not training)

---

## Phase 5: Output & Sensitivity Analysis

**Duration: 2–3 days**

### 5A — Price Recommendation with Confidence Intervals

```
OUTPUT FORMAT:

SDR Individual:  $X  (90% CI: $A - $B)
AE Individual:   $Y  (90% CI: $C - $D)
Team (10 seats): $Z  (90% CI: $E - $F)

Revenue-maximizing:     ($X1, $Y1, $Z1) — expected monthly rev: $___
Conversion-maximizing:  ($X2, $Y2, $Z2) — expected conv rate: ___%
Balanced (recommended): ($X3, $Y3, $Z3) — Pareto-optimal point
```

### 5B — Sensitivity Tornado Charts

What moves the price the most?

- OTE distribution shift (±10%)
- Competitor price change (Aspireship starts charging, CourseCareers drops to $300)
- Refund rate assumption
- Quality perception inflection point
- L&D budget availability
- Market size estimate

### 5C — Scenario Analysis

```
Scenario 1: "Race to bottom"    — competitors drop prices 30%
Scenario 2: "Premium position"  — lean into quality signal, price up 40%
Scenario 3: "Penetration"       — price at floor, maximize market share
Scenario 4: "Segmentation"      — different SDR vs AE pricing (current plan)
Scenario 5: "Single price"      — one price for everyone (simpler)
```

---

## Phase 6: Implementation Architecture

```
pricing/
├── data/
│   ├── collectors/
│   │   ├── bls_api.py               # BLS wage data fetcher
│   │   ├── glassdoor_scraper.py     # Apify integration
│   │   ├── marketplace_scraper.py   # Udemy/Coursera via Apify
│   │   ├── g2_scraper.py           # Competitor reviews
│   │   ├── repvue_manual.csv       # Manually extracted
│   │   └── benchmark_reports.py    # PDF → structured data
│   ├── raw/                         # Raw scraped data
│   └── processed/                   # Cleaned parquet files
│
├── calibration/
│   ├── distribution_fitting.py      # Fit OTE/tenure distributions
│   ├── elasticity_estimation.py     # Price sensitivity curves
│   ├── competitor_model.py          # Substitution probabilities
│   └── parameters.json             # All calibrated params
│
├── simulation/
│   ├── respondent_generator.py      # Synthetic population engine
│   ├── choice_model.py             # Discrete choice simulation
│   └── monte_carlo.py              # 10K market simulation runner
│
├── models/
│   ├── conjoint_bayesian.py        # PyMC hierarchical model
│   ├── multiobjective_optim.py     # NSGA-II pricing optimizer
│   ├── game_theory.py              # Screening + signaling
│   └── ensemble.py                 # Combines all three models
│
├── analysis/
│   ├── sensitivity.py              # Tornado charts
│   ├── scenarios.py                # What-if analysis
│   └── visualizations.py           # Output charts
│
├── run_pricing.py                   # Main entry point
└── requirements.txt
    # numpy, scipy, pandas, pymc, pymoo,
    # scikit-learn, matplotlib, seaborn,
    # requests, beautifulsoup4, apify-client
```

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| Phase 1: Data Collection | 5–7 days | Apify account (~$50), BLS API key (free) |
| Phase 2: Calibration | 3–4 days | Phase 1 complete |
| Phase 3: Synthetic Respondents | 3–4 days | Phase 2 complete |
| Phase 4: Pricing Models | 5–7 days | Phase 3 complete |
| Phase 5: Analysis & Output | 2–3 days | Phase 4 complete |
| Phase 6: Package & Document | 1–2 days | All phases |

**Total: ~3–4 weeks. Cost: ~$0–25 one-time** (Apify free tier covers it).

---

## What This Does NOT Account For

Being straight:

- **Your brand equity** — no model captures the emotional resonance of the landing page you've built. The confession sequence, the Michael cards, the classified dossier — that's conversion lift that doesn't show up in competitor benchmarks.
- **Founder distribution** — if you're selling through personal audience (Twitter, LinkedIn), your conversion rate is 3–5x what cold traffic produces. The model can't price for that without your audience data.
- **First-mover timing** — the market for "honest, practical SDR/AE training by actual reps" barely exists as a category. You're pricing a category, not a product.
- **Post-purchase signal** — refund rate and word-of-mouth are the real pricing feedback loop. The model gets you to launch price. Your Stripe data after 90 days replaces everything above.
