## TITLE

Collective intelligence, with guarantees

---

## KEY QUESTION

How can we better orchestrate complex systems with multiple interacting agents and components?

---

## OPENING

Everything I work on circles around this one question.

It is a bit of a cliché for a researcher to tell you their question is important. But I'll say it anyway, because I think this one really is! It appears in many of the complex systems and infrastructures we interact with every day. For example:

---

## EXAMPLES

### Warehouse robotics

Hundreds of robots must operate safely and efficiently in the same shared space.

**Source:** [Amazon Robotics](https://www.aboutamazon.com/news/operations/amazon-robotics-robots-fulfillment-center)

### Mobility and transit

Travelers, transit operators, and municipalities all make their own decisions over the same transportation network.

### Power grids

Generation, storage, and demand are tightly coupled and constantly changing.

**Source:** [Hydrogen-powered data centres](https://www.mdpi.com/2076-3417/16/7/3479)

### Multi-agent AI

AI agents increasingly need to communicate, reason, coordinate, and act together.

---

These systems look very different on the surface, but underneath they share a common structure: many components interact through a shared environment, each has only a partial view of the system, their decisions affect one another, and they must operate despite imperfect models and hard physical or operational constraints. Across them, three challenges keep reappearing. They are what my research is organized around.

### Limited communication and observation

No agent sees the whole system, and communicating everything to everyone is often impossible.

### Strategic interaction and misaligned incentives

When agents pursue their own objectives, individually rational decisions need not produce a desirable collective outcome.

### Imperfect models and hard constraints

Decisions must remain reliable under imperfect models while still satisfying hard safety and feasibility constraints.

---

## METHOD

My work sits at the intersection of classical control theory, game theory, and optimization, together with newer tools such as reinforcement learning, diffusion models, and language models. I strongly believe in being problem-first rather than tool-first: which hammer to use should depend on the problem.


--- This part moves to Plate 0 --

*Please rename Plate 0 as Overview & Roadmap*

## Overview & Roadmap

My research is organized around three recurring challenges in complex multi-agent systems, with each motivating a major research direction:

**Limited communication and observation**
→ **Control and Learning for Networked Systems**

**Strategic interaction and misaligned incentives**
→ **Multi-Agent Learning through a Game-Theoretic Lens**

**Imperfect models and hard constraints**
→ **Robust and Feasible Decision-Making under Uncertainty**

*The following part corresponds to the three boxes*

### Control and Learning for Networked Systems

Many complex systems are naturally embedded in a network or graph structure. My research asks how we can leverage this structure to design control and learning algorithms that are more scalable, communication-efficient, and data-efficient.

### Multi-Agent Learning through a Game-Theoretic Lens

In complex multi-agent systems, agents may have different incentives. My research studies how agents can reach efficient equilibria efficiently, and, when multiple equilibria exist, how we can steer learning toward outcomes that are better for the system as a whole.

### Robust and Feasible Decision-Making under Uncertainty

Our decisions need to remain reliable despite modeling errors and uncertainty, while also satisfying operational, feasibility, and safety constraints. These requirements become especially challenging in data-driven settings. My research aims to incorporate them into learning and decision-making in a principled way, with theoretical guarantees.


--- Now move on to Plate I ---
*Please rename Plate I to Theme 1...*

## Control and Learning for Networked Systems

**Problem:** Large networked systems are globally coupled, while sensing, communication, and computation are inherently local. Centralized control may provide the best theoretical performance, but it can become impossible to implement or learn at scale.

### Question: When can decentralized control be nearly as good as centralized control?

A common approach in decentralized control is to first restrict the controller to a local or distributed class and then optimize within that class.

I wanted to ask a more fundamental question:

**How much performance do we actually lose because of this decentralization constraint?**

**Finding:** In [*On the Optimal Control of Network LQR with Spatially-Exponential Decaying Structure*](https://arxiv.org/abs/2209.14376), we show that when the underlying networked dynamics have suitable spatial decay, the globally optimal LQR controller itself inherits an approximate spatially decaying structure. As a result, the global optimum can be approximated by a localized controller with a rigorous performance bound.

The part I find conceptually important is that locality is not merely something we impose to make the controller implementable. **Locality can be an intrinsic structural property of the globally optimal solution itself.**

**What remains:** If the optimal solution already has approximate locality, this structure should not only justify decentralized control but also help us design scalable learning algorithms.

↓

### Question: Can locality be exploited to make learning and control scalable?

Once we know that distant interactions have diminishing influence, we do not necessarily need to learn a fully global object.

**Approach:** Use this decay structure to construct local representations and learning algorithms whose complexity scales much more favorably with network size.

This leads to several related works:

- [*Scalable Reinforcement Learning for Linear-Quadratic Control of Networks*](https://arxiv.org/abs/2401.16183) shows that the locality structure also propagates to individual value and Q-functions and develops a local actor-critic algorithm for learning distributed controllers.

- [*Scalable Spectral Representations for Multi-Agent Reinforcement Learning in Network MDPs*](https://arxiv.org/abs/2410.17221) uses exponential decay in network dynamics to construct local spectral representations of Q-functions, leading to scalable learning for continuous-state/action network MDPs with end-to-end guarantees.

- [*Distributed Reinforcement Learning for Decentralized Linear Quadratic Control: A Derivative-Free Policy Optimization Approach*](https://arxiv.org/abs/1912.09135) approaches scalability from a complementary direction, learning local controllers through decentralized zeroth-order policy optimization and consensus using only local information.

The broader principle is to **first understand what structure the global problem or optimal solution possesses, and then translate that structure into reduced communication, computation, or sample complexity.**

**What remains:** Spatial decay is only one useful form of structure. Different networked systems exhibit other kinds of sparsity, communication structure, factorization, or physical structure that may also be exploited.

↓

### Question: What other structures can be translated into algorithmic efficiency?

This question has led me to study several different forms of structure across control, learning, and planning.

**Communication structure → cooperative exploration.**  
In [*Cooperative Multi-Agent Graph Bandits: UCB Algorithm and Regret Analysis*](https://arxiv.org/abs/2401.10383), agents move and collect information over a graph. The graph structure affects both exploration and how quickly agents can access useful locations, and we develop a UCB-based learning algorithm with regret explicitly characterized by the graph structure.

**Graph structure + transient behavior → coverage control.**  
In [*Multi-Agent Coverage Control with Transient Behavior Consideration*](https://arxiv.org/abs/2404.05995), we study coverage when agents must simultaneously learn an unknown spatial density and physically travel between sensing locations. The key point is that transient motion itself contributes to performance rather than only the final sensing configurations.

**Factorization / temporal structure → scalable multi-agent path finding.**  
My recent MAPF work explores several complementary structures:

- [*FICO: Finite-Horizon Closed-Loop Factorization for Unified Multi-Agent Path Finding*](https://arxiv.org/abs/2511.13961) exploits compositional factorization together with finite-horizon closed-loop planning to scale to very large fleets while reacting to execution-time uncertainty.

- [*Adaptive-Horizon Conflict-Based Search for Closed-Loop Multi-Agent Path Finding*](https://arxiv.org/abs/2602.12024) adapts the planning horizon to computational budget while reusing the conflict tree, giving an anytime closed-loop CBS algorithm.

- [*Certificate-Driven Closed-Loop Multi-Agent Path Finding with Inheritable Factorization*](https://arxiv.org/abs/2604.00428) uses certificate trajectories and budgets to recover stronger global guarantees while enabling factorization that can be inherited across time.

**Network structure → power-grid topology control (ongoing).**  
I am exploring MARL for power-grid topology control, asking how the network topology and local interaction structure can be exploited to make learning and control more scalable.

**Learned dynamics + MPC → building control.**  
In [*Adaptive Model Predictive Control with Ensembled Multi-Time Scale Deep-Learning Models for Smart Control of Natural Ventilation*](https://www.sciencedirect.com/science/article/pii/S0360132323005462), we combine multi-timescale learned dynamical models, online adaptation, and MPC for natural-ventilation control, balancing indoor air quality, thermal comfort, and energy efficiency.

Across these projects, the recurring principle is:

**identify structure in the system or optimal solution, then turn it into algorithmic efficiency.**

**Applications:** robotics, transportation, power grids, and smart buildings.