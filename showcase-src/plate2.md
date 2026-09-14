## Multi-Agent Learning through a Game-Theoretic Lens

**Problem:** Multiple agents learn and make decisions independently, often with different or even competing objectives, while their policies interact through a shared environment. As a result, individually rational behavior does not necessarily lead to a desirable collective outcome. The challenge is therefore not only whether decentralized learning converges, but **what it converges to, how good the resulting equilibrium is, and how learning can be steered toward better coordinated outcomes.**

### Question: What do decentralized MARL algorithms actually converge to?

**Summary:** We show that first-order stationary policies and Nash equilibria are equivalent.

There is already a rich theory of convergence in MARL, but much of it stops at showing convergence to first-order stationary points. So my starting question was: **what do these stationary points actually represent?**

**Finding:** In [*Gradient Play in Stochastic Games: Stationary Points, Convergence, and Sample Complexity*](https://arxiv.org/abs/2106.00198), we show that, under direct policy parameterization, first-order stationary policies and Nash equilibria are equivalent.

![](figs/key_figs/stationary_point_NE_equivalence.png)


This was the starting point for me to realize that game-theoretic concepts arise naturally in MARL. Once multiple agents independently optimize decentralized policies while interacting through a shared environment, Nash equilibrium becomes a natural solution concept, even when the underlying problem is cooperative.

From there, we studied how this picture changes under different policy parameterizations and game structures. For example:

- [*On the Global Convergence Rates of Decentralized Softmax Gradient Play in Markov Potential Games*](https://arxiv.org/abs/2202.00872) studies the more subtle softmax parameterization, where zero-gradient policies need not be Nash equilibria, and establishes finite-time convergence guarantees for decentralized gradient and natural-gradient play.

- [*Policy Optimization for Markov Games: Unified Framework and Faster Convergence*](https://arxiv.org/abs/2206.02640) develops a broader framework for policy optimization in Markov games, with faster convergence guarantees for zero-sum games and extensions to general-sum games.

**What remains:** Convergence to a Nash equilibrium does not by itself imply good system-level performance. There can be many equilibria, and their quality can differ substantially.

↓

### Question: How good or bad can an equilibrium be?

**Summary:** We established price-of-anarchy bound for Markov games, providing a rigorous characterization of the worst-case quality of Nash equilibrium.

Once equilibrium becomes the relevant solution concept, the next natural question is how its performance compares with the globally desirable outcome.


![](figs/key_figs/poa_figure.png)

**Finding:** In [*Markov Games with Decoupled Dynamics: Price of Anarchy and Sample Complexity*](https://arxiv.org/abs/2304.03840), we extend the price-of-anarchy perspective to finite-horizon Markov games with decoupled dynamics and coupled rewards, providing a rigorous characterization of the worst-case quality of decentralized equilibria.

This turns a convergence result into a performance question: even if decentralized learning converges, what can we actually guarantee about the resulting system-level performance?

**What remains:** Price of anarchy tells us how bad an equilibrium can be, but it does not tell us how to avoid undesirable equilibria or systematically reach better ones.

↓

### Question: Can we systematically reach better equilibria?

**Summary:** We develop a framework for equilibrium selection in multi-agent RL.

This led to my work on **equilibrium selection**.

**Approach:** In [*Equilibrium Selection for Multi-agent Reinforcement Learning: A Unified Framework*](https://arxiv.org/abs/2406.08844), we borrow ideas from equilibrium selection in static normal-form games, especially stochastic stability, and develop a framework for transferring these equilibrium-selection mechanisms to stochastic games.

The goal is to move beyond simply proving convergence and instead understand how learning dynamics can favor equilibria with desirable properties.

**What remains:** The framework gives a principled theoretical mechanism for equilibrium selection, but the resulting selection dynamics can be slow in practice. We would like more direct and efficient ways to discover desirable coordinated behaviors rather than relying on slow asymptotic selection.

↓

### Question: Can we discover and select good coordinated behaviors more efficiently?

**Summary:** Leveraging optimism and diversity

This motivates my more recent work on algorithmic mechanisms that shape the behaviors discovered during learning.

- **Optimism / risk-seeking:** In [*Optimism as Risk-Seeking in Multi-Agent Reinforcement Learning*](https://arxiv.org/abs/2509.24047), we interpret optimism through risk-seeking objectives and develop decentralized optimistic actor-critic algorithms. The idea is that optimism can encourage agents to explore coordinated outcomes that risk-neutral learning may fail to reach.

- **Diversity (ongoing):** Can we deliberately discover and maintain qualitatively different coordinated behaviors / equilibria instead of collapsing to one solution?



So the question has gradually evolved from **“Does MARL converge?”** to **“Can MARL efficiently discover and select high-quality coordinated behaviors?”**

### Application: Transportation Operations and System Design

Transportation systems provide a natural setting for these questions because different regions, operators, and mobility services make their own decisions while sharing infrastructure, users, and congestion.

In [*Co-Investment with Payoff-Sharing Mechanism for Cooperative Decision-Making in Network Design Games*](https://arxiv.org/abs/2508.12059), we study strategic interactions among interconnected network operators. The framework combines a non-cooperative network-design game with cooperative mechanisms for **co-investment and payoff sharing**, asking when independently operated subnetworks can find mutually beneficial opportunities to cooperate while preserving their individual incentives.

![](figs/key_figs/coinv_framework.png)


A related but different question is how to induce a desired system-level outcome when operators remain strategic. In [*Implementation-Based Incentive Design for Autonomous Mobility-on-Demand and Transit Systems*](https://arxiv.org/abs/2605.18687), we take an implementation perspective: rather than searching for a policy and then predicting which equilibrium it induces, we start from a desirable target operating profile and ask **what incentive is needed to make unilateral deviations unattractive**. This leads to an implementation-based framework for coordinating strategic AMoD and public-transit operators under endogenous passenger choices.

![](figs/key_figs/amod_framework.png)


