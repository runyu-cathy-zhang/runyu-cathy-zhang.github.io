## Control and Learning for Networked Systems

**Problem:** Large networked systems are globally coupled, while sensing, communication, and computation are inherently local. In practice, no agent has access to the entire system, and fully centralized solutions quickly become difficult to implement or learn as the network grows. This tension between **global performance and local information** is where much of my work in networked control and learning begins.

When information is inherently local, a natural approach is distributed control, where each agent makes decisions using only the information available within its local neighborhood.

### Question: When can distributed control be nearly as good as centralized control?

**Summary:** We find that the optimal controller is already approximately local, with a provable bound on the loss from localizing it.

Distributed control has a long history, however, much of the literature focuses on finding the best controller within a prescribed distributed class. But a more fundamental question has received comparatively less attention: **how much performance do we lose relative to the globally optimal centralized controller?**

**Finding:** In [*On the Optimal Control of Network LQR with Spatially-Exponential Decaying Structure*](https://arxiv.org/abs/2209.14376), we show that when the underlying networked dynamics exhibit suitable spatial decay, the globally optimal LQR controller itself inherits an approximately spatially decaying structure. As a result, it can be well approximated by a localized controller, with a rigorous bound on the resulting performance loss.

![](figs/key_figs/sed_lqr_spatial_decay.png)


What I find most interesting about this result is that locality is not merely a restriction we impose to make control implementable. **Under the right system structure, locality is already present in the globally optimal solution.**

**What remains:** If the optimal solution itself has approximate locality, can we exploit this structure not only for decentralized control, but also to make learning more scalable?

↓

### Question: Can locality be exploited to make learning and control scalable?

**Summary:** Locality carries over to value functions, giving learning algorithms that scale with local interactions rather than network size.

Building on our work from the previous section, once we know that the influence of distant parts of the network decays, it provides the potential just learn local policies that already captures what matters instead of trying to learn a fully global one.

**Approach:** Use this decay structure to build local representations and learning algorithms whose complexity depends primarily on local interactions rather than the full network size.

This idea leads to several related works:

* [*Scalable Reinforcement Learning for Linear-Quadratic Control of Networks*](https://arxiv.org/abs/2401.16183) shows that locality also propagates to individual value and Q-functions, and develops a local actor-critic algorithm for learning distributed controllers.

* [*Scalable Spectral Representations for Multi-Agent Reinforcement Learning in Network MDPs*](https://arxiv.org/abs/2410.17221) further extend our results to the more complex setting with nonlinear dynamics, where it uses exponential decay in network dynamics to construct local spectral representations of Q-functions, leading to scalable learning for continuous-state/action network MDPs with end-to-end guarantees.

* [*Distributed Reinforcement Learning for Decentralized Linear Quadratic Control: A Derivative-Free Policy Optimization Approach*](https://arxiv.org/abs/1912.09135) approaches the same challenge from a complementary direction, learning local controllers through decentralized zeroth-order policy optimization and consensus using only local information.

**What remains:** Spatial decay is only one form of useful structure. Real networked systems often contain other kinds of sparsity, communication structure, factorization, temporal structure, or physical structure. Can those also be turned into algorithmic efficiency?

↓

### Question: What other structures can be translated into algorithmic efficiency?

**Summary:** Graph structure, factorization and multiple timescales each convert into algorithmic efficiency.

Spatial locality is only one example. Across different applications, I have explored how other forms of structure can similarly guide algorithm design.

**Graph structure → exploration and coverage.**

![](figs/key_figs/graph-bandit.gif)
![](figs/key_figs/coverage-control.gif)

In [*Cooperative Multi-Agent Graph Bandits*](https://arxiv.org/abs/2401.10383), we exploit communication and mobility structure to design cooperative exploration algorithms whose performance reflects the underlying graph. In [*Multi-Agent Coverage Control with Transient Behavior Consideration*](https://arxiv.org/abs/2404.05995), we further account for how agents physically move through the environment while learning, rather than optimizing only their eventual coverage configuration.

**Factorization + temporal structure → scalable multi-agent path finding.**

![](figs/key_figs/fico_grouping.png)
![](figs/key_figs/fico-result.gif)

My recent MAPF work exploits problem factorization and adaptive planning horizons to coordinate large robot fleets in closed loop: [FICO](https://arxiv.org/abs/2511.13961), [Adaptive-Horizon CBS](https://arxiv.org/abs/2602.12024), and [Certificate-Driven MAPF](https://arxiv.org/abs/2604.00428).

**Multiple timescales → building control.**
In our work on [natural-ventilation control](https://www.sciencedirect.com/science/article/pii/S0360132323005462), we combine learned dynamics at multiple timescales, online adaptation, and MPC for energy-efficient building operation.

**Network structure → power-grid topology control (ongoing).**
I am exploring how grid topology and local interactions can determine what information agents need for scalable multi-agent learning and control.

Across these applications, the recurring idea is simple:

**identify useful structure in the system, then turn it into algorithmic efficiency.**
