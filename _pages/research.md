---
layout: archive
title: "Research Topics"
permalink: /research/
author_profile: true
---

<p class="research-statement-link">
  <a href="{{ site.url }}{{ site.baseurl }}/research/statement/">Read my research statement as a webpage &rarr;</a>
  <span>An illustrated walk-through of the questions behind the work below.</span>
</p>

Topic 1: Distributed Control of Network Systems
----
<div style="float: left; margin-right: 20px; margin-bottom:20px">
<img src="https://runyu-cathy-zhang.github.io/images/distributed-control.png" alt="distributed-control-illustration" width="600px" height="auto">
</div>

Limited by the sensing and communication capability, in many multi-agent systems, agents must decide their local actions based on local information. My research focuses on the distributed learning and control of network systems, which explores how multiple controllers, often geographically dispersed within a network, can collaboratively achieve global objectives by only sharing local information and relying on limited communication. By leveraging advanced techniques in control theory, optimization, and network theory, my research aims to enhance the efficiency and reliability of applications ranging from smart grids and automated transportation systems to large-scale industrial processes and sensor networks. Some specific topics that I am now particularly interested in includes
- Better theoretical understanding of the limitation and capability of distributed controller (e.g. what is the optimality gap between distributed local controllers and the optimal global controller?)
- Practical distributed control/learning algorithm design for network systems (e.g. robotic swarms, power system)
- Integrating control and learning (e.g. can we jointly learn a good communication and distributed control policy?)

### Selected publications:


<div style="display: flex; align-items: center;">
    <img src="https://runyu-cathy-zhang.github.io/images/SED-LQR.png" alt="SED-LQR" style="width: 300px; height: auto;">
    <div style="margin-left: 0px;">
        <ul>
            <li>
                <a href="https://arxiv.org/abs/2401.16183" target="_blank">Scalable Reinforcement Learning for Linear-Quadratic Control of Networks</a>
                <br> Johan Olsson, <strong>Runyu Zhang</strong>, Emma Tegling, Na Li
                <br> <em>American Control Conference (ACC), 2024</em>
            </li>
            <li>
                <a href="https://arxiv.org/abs/2209.14376" target="_blank">On the Optimal Control of Network LQR with Spatially-exponential Decaying Structure</a>
                <br> <strong>Runyu Zhang</strong>, Weiyu Li, Na Li
                <br> <em>American Control Conference (ACC), 2023</em> (Preparing for Journal Submission)
            </li>
        </ul>
    </div>
</div>


<div style="display: flex; align-items: center;">
    <img src="https://runyu-cathy-zhang.github.io/images/drone-demo.gif" alt="drone gif" style="width: 250px; height: auto;">
    <div style="margin-left: 50px;">
        <ul>
            <li>
                <a href="https://arxiv.org/abs/2404.05995" target="_blank">Multi-Agent Coverage Control with Transient Behavior Consideration</a>
                <br> <strong>Runyu Zhang</strong>, Haitong Ma, Na Li
                <br> <em>Learning for Dynamics and Control Conference (L4DC), 2024</em>
            </li>
        </ul>
    </div>
</div>


Topic 2: Multi-agent Reinforcement Learning
----


<div style="float: left; margin-right: 20px;">
    <img src="https://runyu-cathy-zhang.github.io/images/multi-agent-RL.png" alt="Multi-agent-RL" style="width: 300px; height: auto;">
</div>

Unlike single-agent RL, multi-agent RL deals with multiple agents interacting in a shared, dynamic setting. This introduces unique challenges such as the need for coordination, dealing with non-stationary environments due to other learning agents, and handling the complexity of strategic interactions. Studying multi-agent RL is crucial for advancing our understanding of systems where autonomous agents must learn to coexist, compete, or collaborate, such as in autonomous vehicle fleets, and complex resource management scenarios. The key question that I try to answer is how to encourage collaborative behavior in the face of these above challenges.


### Selected publications:


<div style="display: flex; align-items: center;">
    <img src="https://runyu-cathy-zhang.github.io/images/gradient-play-convergence.png" alt="gradient-play" style="width: 250px; height: auto;">
    <div style="margin-left: 50px;">
        <ul>
            <li>
                <a href="https://arxiv.org/pdf/2106.00198" target="_blank">Gradient Play in Stochastic Games: Stationary Points and Local Geometry</a>
                <br> <strong>Runyu Zhang</strong>, Zhaolin Ren, Na Li
                <br> <em>Transaction on Automatic Control (TAC), 2024</em>
            </li>
            <li>
                <a href="https://arxiv.org/abs/2202.00872" target="_blank">On the Global Convergence Rates of Decentralized Softmax Gradient Play in Markov Potential Games
</a>
                <br> <strong>Runyu Zhang</strong>, Jincheng Mei, Bo Dai, Dale Schuurmans, Na Li
                <br> <em>Advances in Neural Information Processing Systems (NeurIPS), 2022 </em>
            </li>
        </ul>
    </div>
</div>



<div style="display: flex; align-items: center;">
    <img src="https://runyu-cathy-zhang.github.io/images/PO-2p0s.png" alt="drone gif" style="width: 250px; height: auto;">
    <div style="margin-left: 50px;">
        <ul>
            <li>
                <a href="https://arxiv.org/abs/2206.02640" target="_blank"> Policy Optimization for Markov Games: Unified
Framework and Faster Convergence</a>
                <br> <strong>Runyu Zhang</strong>* , Qinghua Liu*, Huan Wang, Caiming Xiong, Na Li, Yu Bai
                <br> <em>Advances in Neural Information Processing Systems (NeurIPS), 2022</em>
            </li>
        </ul>
    </div>
</div>


Topic 3:  Robust, Risk-sensitive and Safe Reinforcement Learning
----
<div style="float: left; margin-right: 20px;">
    <img src="https://runyu-cathy-zhang.github.io/images/risk-sensitive-RL.png" alt="Multi-agent-RL" style="width: 450px; height: auto;">
</div>
Robustness, risk-sensitivity and safety are desired properties for tasks such as online decision making and controlling dynamical systems, especially in the face of model uncertainty or estimation errors. I'm actively exploring the possibility of sample efficient practical algorithms that embody these desired properties. Further, I am also interested in extending these principles to multi-agent reinforcement learning (RL), where robustness is even more critical due to the added complexity of interactions among multiple agents. 

### Selected publications:

<div style="display: flex; align-items: center;">
    <img src="https://runyu-cathy-zhang.github.io/images/robust-MDP.png" alt="drone gif" style="width: 250px; height: auto;">
    <div style="margin-left: 50px;">
        <ul>
            <li>
                <a href="https://arxiv.org/abs/2306.11626" target="_blank">Soft Robust MDPs and Risk-Sensitive MDPs: Equivalence, Policy Gradient, and
Sample Complexity</a>
                <br> <strong>Runyu Zhang</strong>, Hu Yang, Na Li
                <br> <em>International Conference on Learning Representations (ICLR), 2024</em>
            </li>
        </ul>
    </div>
</div>

