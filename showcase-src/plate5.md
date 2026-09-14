## HEADLINE

Coordination architectures for composable multi-agent systems

---

## LEAD

As autonomous agents become more capable, the next bottleneck may not be training one stronger agent, but assembling many independently trained agents into a capable team.

---

## OPENING

Today, many multi-agent systems still rely on strong assumptions: agents are trained together, share the same conventions, or adapt to each other only after observing enough behavior. But future systems will likely be much messier. Robots, AI agents, infrastructure controllers, and decision-making modules may be trained by different groups, on different data, with different objectives, interfaces, and hidden conventions. They may need to work together without joint retraining.

There are already rich lines of work on related problems, including zero-shot coordination, ad hoc teamwork, theory of mind, multi-agent communication, and teammate modeling. These works answer important pieces of the puzzle. But I am interested in a broader architectural question: **what should the coordination architecture look like when independently trained agents need to become a team?**

A useful analogy is modular software. A module is not useful only because its internal code is good. It is useful because it has an interface: other modules know what it expects, what it provides, and how to interact with it. Multi-agent systems need something similar, but richer. An agent's interface should also help others understand what it can do, how it tends to behave, what information it needs, and how it can be adjusted. That is why I think coordination should be treated as an **architectural layer**, not merely as an emergent property of self-play or behavior-only adaptation.

---

## FIGURE

![](figs/key_figs/composability.png)

---

## COMPONENTS

### Incoming interface

**Summary:** How an agent understands and reacts to what it receives.

Once useful information is exposed, another agent must be able to use it. It should not simply store context as text or metadata. It should convert that information into decisions: what role to take, what behavior to expect, what operating mode to use, when to communicate, and when to revise its belief.

For example, if another agent tends to take a certain role, has limited sensing, rarely yields at bottlenecks, or was trained on a different task distribution, the receiving agent should know how this changes its own behavior.

This connects naturally to teammate modeling, theory of mind, and ad hoc teamwork, but the goal is broader. The incoming interface should become a reusable mechanism for understanding and reacting to new partners, not just a task-specific adaptation trick.

* How should an agent convert incoming context into beliefs, roles, plans, or operating modes?
* How should agents use those beliefs, roles, plans or operating modes to make decisions?
* How should an agent refine its interpretation as it observes more behavior?

### Train for composability

**Summary:** How to train agents to coordinate, communicate, and adapt.

The outgoing and incoming interfaces should not be treated as afterthoughts added after training. If agents will later be assembled into new teams, they should be trained not only to perform well, but also to be understandable, adaptable, and useful to others. This means agents should learn how to expose useful information, interpret incoming information, and adjust their behavior when coordination changes.

This is the part that makes the vision more than a protocol design problem. A useful coordination architecture cannot only be written down after training. It should influence the training process itself.

* How do we train agents whose behavior is legible to new partners?
* How do we train agents to communicate the right information at the right level of abstraction?
* How do we train agents to deliberately use incoming context rather than ignore it?
* How do we train adaptable operating modes, so that an agent can be steered without full retraining?
* How do we evaluate whether an agent is composable, not just high-performing?

### Outgoing interface

**Summary:** What useful information an agent should report about itself.

An agent may need to report information about its training background, behavioral tendencies, capabilities, uncertainty, current intent, or available operating modes. This information could be encoded in structured fields, natural language, learned embeddings, diagnostic statistics, or a hybrid format. The key is that it should be useful for coordination.

This is related to multi-agent communication, model cards, agent interoperability, and language-grounded coordination. But here the goal is not only communication for one task. The goal is to understand what kind of outgoing interface makes agents easier to compose with others.

* What should an agent communicate before interaction begins, and what kinds of teammate information are useful for decision-making?
* What should it communicate during interaction?
* How can it summarize its training history, behavior, capabilities, and limitations in a compact way?

---

## CLOSING

The long-term goal is a principled architecture for open multi-agent coordination: a way for agents to expose useful information, understand incoming context, adapt through interaction, and be trained for composability from the beginning. Not a rigid hand-coded rulebook, but a structure through which agents make themselves understandable to others, receive and use coordination-relevant information, and adapt as the team and task evolve. This is the kind of multi-agent intelligence I want to build next: agents that do not only perform well alone, but can be **assembled, connected, adapted, and deployed** as robust teams.
