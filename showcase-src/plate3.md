## Robust and Feasible Decision-Making under Uncertainty

**Problem:** Real systems must make decisions with imperfect models and incomplete knowledge of the environment, while also satisfying physical, operational, and safety constraints. Model errors can make an otherwise good decision unreliable, and some requirements cannot simply be traded against performance. The challenge is therefore twofold: **how do we remain robust when our model is wrong, and how do we preserve feasibility when constraints must be satisfied?**

### Question: How should we make decisions when the model is imperfect?

**Summary:** We develop efficient and robust offline reinforcement-learning algorithms for decision-making under model uncertainty.

My starting point was **robust decision-making**: if we do not fully trust one nominal model of the environment, how should that uncertainty change the way we optimize a policy?

**Finding:** In [*Soft Robust MDPs and Risk-Sensitive MDPs: Equivalence, Policy Gradient, and Sample Complexity*](https://arxiv.org/abs/2306.11626), we establish an equivalence between a class of soft robust MDPs and risk-sensitive MDPs. This connection allows us to solve robust RL through risk-sensitive formulations, leading to **more efficient algorithms and sample-complexity guarantees under weaker assumptions than prior robust RL approaches**. In particular, the resulting methods avoid repeatedly solving costly inner robust-optimization problems while retaining a principled treatment of model uncertainty.

**What remains:** Robustness protects performance against model uncertainty. But many physical systems also impose requirements that cannot simply be traded against performance: dynamics must hold, safety limits must be respected, and trajectories must remain feasible.

↓

### Question: How do we optimize performance while preserving feasibility?

**Summary:** We develop control-inspired constrained optimization methods that actively regulate feasibility while optimizing performance.

The answer depends on **what access we have to the feasible set**.

![](figs/key_figs/FOFL.png)

**Differentiable constraints → control-theoretic constrained optimization.**  
When constraints are explicitly known and differentiable, we can view constrained optimization as a control problem: design the optimization dynamics so that constraint violation is regulated to zero while the objective decreases. In [*Constrained Optimization From a Control Perspective via Feedback Linearization*](https://arxiv.org/abs/2503.12665), we use feedback linearization to construct such updates with a prescribed feasibility decay rate, yielding convergence guarantees to KKT points and a principled alternative to penalty-based constraint handling.


Our work also extends to machine learning. In [*AdamFLIP*](https://arxiv.org/abs/2605.08408), we apply these ideas to hard-constrained physics-informed neural network training, achieving better optimization performance while enforcing constraints directly rather than through penalty terms.

![](figs/key_figs/ZOFL.png)



**Black-box constraints → zeroth-order constrained optimization.**  
Sometimes we can evaluate a constraint but cannot differentiate it. Hence, the required derivatives must be estimated from function queries. These zeroth-order estimates can be inaccurate, making feasibility especially challenging: errors in the estimated constraint gradients directly affect the correction used to enforce the constraints.

In [*Zeroth-Order Constrained Optimization via Feedback Linearization*](https://arxiv.org/abs/2509.24056), we extend the control-theoretic formulation to this setting and study how feasibility can still be regulated despite gradient-estimation error. Our later work, [*Random-Subspace SQP*](https://arxiv.org/abs/2604.02202), provides a complementary optimization perspective on this idea: the zeroth-order update can be understood through optimization over randomly sampled low-dimensional subspaces. This interpretation leads to a more general algorithmic framework and stronger convergence guarantees, while retaining the computational advantage of avoiding full-dimensional derivative estimation.

**What remains:** Both settings still assume that feasibility is explicitly defined. But in increasingly data-driven systems, we may only have examples of feasible behavior, with no constraint equation available at all.

↓

### Question: How do we optimize when feasibility is represented only through data?

**Summary:** Diffusion models can encode feasible behavior directly from data, allowing optimization over an implicitly learned feasible set.

This is the setting I am studying in **diffusion-based planning**.

A diffusion model trained on feasible trajectories can represent complex feasible behavior directly from data, even when no explicit description of the feasible trajectory set is available. This makes diffusion a natural model of feasibility for planning and decision-making.

![](figs/key_figs/gradient-guidance.png)

The challenge is that standard gradient guidance optimizes the task objective in the ambient trajectory space. As a result, the gradient can point away from the learned feasible set, so improving the objective may simultaneously destroy dynamic feasibility.


**Approach:** Our work on [Denoising-Corrected Gradient Guidance (DCG)](https://arxiv.org/abs/2608.29507) views diffusion planning as constrained optimization over an implicitly learned feasible set. The key insight is that the denoiser behaves like an approximate projection onto the data support: the gradient step improves the objective, while denoising corrects the trajectory back toward feasible behavior. This leads to a simple guided-diffusion algorithm with finite-time convergence guarantees under linear, convex, and smooth-manifold geometries.

![](figs/key_figs/DCG-result.jpg)
![](figs/key_figs/DCG-result-2.jpg)

![](figs/key_figs/DCG-result-legend.jpg)





