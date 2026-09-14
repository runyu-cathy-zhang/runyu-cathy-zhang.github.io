/* ============================================================
   Research content — Runyu (Cathy) Zhang  ·  v3 (adds thesis, applications, future)
   Used by v5-vision.html.

   Each step carries, deliberately:
     q            the question
     findingBrief one line, shown on the closed card
     gap          short connector text, shown BETWEEN cards
     tension[]    why the question is forced on us
     finding[]    what we found, at the level of meaning
     remains      the longer version of what it left open
   ============================================================ */

const CENTRAL = "How do we better orchestrate complex systems with multiple interacting agents and components?";

const TOOLS = "Reinforcement learning, control, game theory, optimization, diffusion models. Each tool showed up because a question demanded it — none of the three themes is defined by a method.";

/* ---------------- drawn illustrations ---------------- */



const SVG_NASH = `
<svg viewBox="0 0 470 250" xmlns="http://www.w3.org/2000/svg" class="figsvg">
  <defs>
    <marker id="nx" markerWidth="8" markerHeight="8" refX="6" refY="3.4" orient="auto">
      <path d="M0,0 L7,3.4 L0,6.8 Z" fill="var(--dgm-mut)"/></marker>
    <marker id="ng" markerWidth="8" markerHeight="8" refX="6" refY="3.4" orient="auto">
      <path d="M0,0 L7,3.4 L0,6.8 Z" fill="currentColor"/></marker>
  </defs>
  <rect x="74" y="26" width="336" height="168" fill="var(--dgm-wash)" stroke="var(--dgm-faint)" stroke-width="1"/>
  <g fill="none" stroke="var(--dgm-faint)" stroke-width="1">
    <ellipse cx="332" cy="72" rx="70" ry="52" transform="rotate(-24 332 72)"/>
    <ellipse cx="332" cy="72" rx="46" ry="33" transform="rotate(-24 332 72)"/>
    <ellipse cx="332" cy="72" rx="22" ry="15" transform="rotate(-24 332 72)"/>
  </g>
  <text x="242" y="222" text-anchor="middle" class="ilbl">agent 1&#39;s policy &#8594;</text>
  <text x="52" y="110" text-anchor="middle" class="ilbl" transform="rotate(-90 52 110)">agent 2&#39;s policy &#8594;</text>
  <path d="M162,158 L238,158" fill="none" stroke="var(--dgm-mut)" stroke-width="1.5" marker-end="url(#nx)"/>
  <text x="248" y="162" text-anchor="start" class="ilbl-i">no gain</text>
  <path d="M150,146 L150,92" fill="none" stroke="var(--dgm-mut)" stroke-width="1.5" marker-end="url(#nx)"/>
  <text x="143" y="86" text-anchor="end" class="ilbl-i">no gain</text>
  <path d="M163,147 C214,124 268,100 312,82" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-dasharray="5 4" marker-end="url(#ng)"/>
  <text x="238" y="133" text-anchor="middle" class="ilbl-i" fill="currentColor">gain &#8212; but only if both move</text>
  <circle cx="150" cy="158" r="6" fill="var(--dgm-ink)"/>
  <text x="150" y="186" text-anchor="middle" class="ilbl">Nash</text>
  <path d="M332,64 l5.2,10.8 11.9,1.7 -8.6,8.3 2.1,11.8 -10.6,-5.6 -10.6,5.6 2.1,-11.8 -8.6,-8.3 11.9,-1.7 z"
        fill="currentColor"/>
  <text x="332" y="50" text-anchor="middle" class="ilbl">social optimum</text>
</svg>`;

/* Constraint violation as a regulated output. */
const REG_CURVES = [[0.95,'currentColor',2],[0.42,'var(--dgm-mut)',1.4],[0.17,'var(--dgm-faint)',1.4]]
  .map(function(c){
    var k=c[0], col=c[1], w=c[2], pts=[];
    for(var i=0;i<40;i++){
      var t=i/39*176, y=112-102*Math.exp(-k*(t/26));
      pts.push(t.toFixed(1)+','+y.toFixed(1));
    }
    return '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"/>';
  }).join('');

const SVG_REGULATE = `
<svg viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" class="figsvg">
  <defs>
    <marker id="rb" markerWidth="8" markerHeight="8" refX="6" refY="3.4" orient="auto">
      <path d="M0,0 L7,3.4 L0,6.8 Z" fill="var(--dgm-mut)"/></marker>
  </defs>
  <g stroke="var(--dgm-mut)" stroke-width="1.3" fill="none" marker-end="url(#rb)">
    <path d="M112,70 L136,70"/>
    <path d="M160,70 L176,70"/>
    <path d="M262,70 L292,70"/>
    <path d="M219,88 L219,122"/>
    <path d="M166,139 H148 V84"/>
  </g>
  <rect x="12" y="54" width="100" height="32" fill="var(--dgm-paper)" stroke="currentColor" stroke-width="1.2"/>
  <text x="62" y="74" text-anchor="middle" class="ilbl">objective step</text>
  <circle cx="148" cy="70" r="11" fill="var(--dgm-paper)" stroke="var(--dgm-mut)" stroke-width="1.2"/>
  <text x="148" y="75" text-anchor="middle" class="ilbl">+</text>
  <rect x="176" y="54" width="86" height="32" fill="var(--dgm-paper)" stroke="var(--dgm-mut)" stroke-width="1.2"/>
  <text x="219" y="74" text-anchor="middle" class="ilbl">update x</text>
  <text x="300" y="74" class="ilbl">x</text>
  <rect x="166" y="124" width="106" height="30" fill="var(--dgm-paper)" stroke="currentColor" stroke-width="1.2"/>
  <text x="219" y="143" text-anchor="middle" class="ilbl">violation h(x)</text>
  <text x="86" y="134" text-anchor="middle" class="ilbl-i" fill="currentColor">fed back</text>
  <g transform="translate(320,44)">
    <line x1="0" y1="112" x2="176" y2="112" stroke="var(--dgm-faint)" stroke-width="1"/>
    <line x1="0" y1="112" x2="0" y2="6" stroke="var(--dgm-faint)" stroke-width="1"/>
    ${REG_CURVES}
    <text x="176" y="128" text-anchor="end" class="ilbl">iterations</text>
    <text x="-6" y="14" text-anchor="end" class="ilbl">&#8214;h&#8214;</text>
    <text x="94" y="30" text-anchor="middle" class="ilbl-i" fill="currentColor">you pick this rate</text>
  </g>
  <text x="260" y="220" text-anchor="middle" class="ilbl-i">a decay rate is a specification; a penalty weight is a guess</text>
</svg>`;

/* Diffusion guidance corrected by denoising. */
const DIFF_DOTS = (function(){
  var out=[];
  for(var k=0;k<30;k++){
    var t=k/29, x=36+t*474;
    var y=158+(-68*Math.sin(t*2.1))+(t*t*42)+((k*53)%13-6);
    out.push('<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="1.7" fill="currentColor" opacity=".4"/>');
  }
  return out.join('');
})();

const SVG_DIFFUSION = `
<svg viewBox="0 0 540 240" xmlns="http://www.w3.org/2000/svg" class="figsvg">
  <defs>
    <marker id="dg" markerWidth="8" markerHeight="8" refX="6" refY="3.4" orient="auto">
      <path d="M0,0 L7,3.4 L0,6.8 Z" fill="var(--dgm-mut)"/></marker>
    <marker id="dn" markerWidth="8" markerHeight="8" refX="6" refY="3.4" orient="auto">
      <path d="M0,0 L7,3.4 L0,6.8 Z" fill="var(--dgm-alt)"/></marker>
  </defs>
  <path d="M36,158 C104,92 194,70 282,82 C378,96 456,124 510,104"
        fill="none" stroke="currentColor" stroke-width="24" opacity=".13" stroke-linecap="round"/>
  <path d="M36,158 C104,92 194,70 282,82 C378,96 456,124 510,104"
        fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 5" opacity=".6"/>
  <text x="72" y="196" class="ilbl-i" fill="currentColor">what the model learned to call feasible</text>
  ${DIFF_DOTS}
  <circle cx="222" cy="78" r="5.5" fill="var(--dgm-ink)"/>
  <text x="214" y="62" text-anchor="middle" class="ilbl">current trajectory</text>
  <path d="M228,73 L310,36" fill="none" stroke="var(--dgm-mut)" stroke-width="1.5" marker-end="url(#dg)"/>
  <text x="352" y="26" text-anchor="middle" class="ilbl">&#8711; task objective</text>
  <circle cx="314" cy="34" r="4.5" fill="none" stroke="var(--dgm-mut)" stroke-width="1.2" stroke-dasharray="2 2"/>
  <text x="416" y="52" text-anchor="middle" class="ilbl-i">better score, not a trajectory</text>
  <path d="M313,43 C307,58 303,70 301,80" fill="none" stroke="var(--dgm-alt)" stroke-width="1.7" marker-end="url(#dn)"/>
  <text x="252" y="128" text-anchor="middle" class="ilbl" fill="var(--dgm-alt)">denoise = correct</text>
  <circle cx="301" cy="86" r="5.5" fill="var(--dgm-alt)"/>
  <text x="372" y="92" text-anchor="middle" class="ilbl">better, still feasible</text>
</svg>`;

/* ---------------- themes ---------------- */

const SVG_COORD = `<svg viewBox="0 0 420 262" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <defs>
    <marker id="cdA" markerWidth="8" markerHeight="8" refX="6" refY="3.2" orient="auto">
      <path d="M0,0 L6.5,3.2 L0,6.4 Z" class="dgm-fill-mut"/></marker>
  </defs>
  <path d="M34,232 H404" class="dgm-axis" fill="none"/>
  <path d="M34,232 V34" class="dgm-axis" fill="none"/>
  <text x="24" y="132" text-anchor="middle" transform="rotate(-90,24,132)" class="dgm-lbl">group welfare</text>
  <text x="219" y="252" text-anchor="middle" class="dgm-lbl">joint behaviour</text>

  <path d="M44,208 C78,208 104,126 138,126 C170,126 190,186 220,186
           C254,186 300,64 336,64 C362,64 382,110 398,140"
        class="dgm-curve" fill="none"/>

  <path d="M138,64 H336" class="dgm-level" fill="none"/>
  <path d="M112,64 V117" class="dgm-gap" fill="none"/>
  <path d="M107,64 H117 M107,117 H117" class="dgm-gap" fill="none"/>
  <text x="100" y="86" text-anchor="end" class="dgm-em">what the</text>
  <text x="100" y="101" text-anchor="end" class="dgm-em">group lost</text>

  <circle cx="138" cy="117" r="9" class="dgm-ball"/>
  <path d="M120,126 L106,138" class="dgm-mut" fill="none" marker-end="url(#cdA)"/>
  <path d="M156,126 L170,140" class="dgm-mut" fill="none" marker-end="url(#cdA)"/>
  <text x="138" y="170" text-anchor="middle" class="dgm-lbl">no agent gains</text>
  <text x="138" y="184" text-anchor="middle" class="dgm-lbl">by moving alone</text>

  <circle cx="336" cy="64" r="5" class="dgm-star"/>
  <text x="336" y="50" text-anchor="middle" class="dgm-em">the outcome</text>
  <text x="336" y="35" text-anchor="middle" class="dgm-em">we wanted</text>
</svg>`;

const SVG_SCALE = `<svg viewBox="0 0 420 262" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <path d="M150.0,130.0 L198.0,130.0 M150.0,130.0 L174.0,171.6 M150.0,130.0 L126.0,171.6 M150.0,130.0 L102.0,130.0 M150.0,130.0 L126.0,88.4 M150.0,130.0 L174.0,88.4 M198.0,130.0 L237.5,158.4 M198.0,130.0 L237.5,101.6 M174.0,171.6 L204.1,204.4 M174.0,171.6 L150.0,222.0 M126.0,171.6 L95.9,204.4 M126.0,171.6 L150.0,222.0 M102.0,130.0 L62.5,158.4 M102.0,130.0 L62.5,101.6 M126.0,88.4 L95.9,55.6 M126.0,88.4 L150.0,38.0 M174.0,88.4 L204.1,55.6 M174.0,88.4 L150.0,38.0 M237.5,158.4 L278.0,130.0 M204.1,204.4 L253.6,205.2 M150.0,222.0 L110.4,251.7 M95.9,204.4 L46.4,205.2 M62.5,158.4 L22.0,130.0 M62.5,101.6 L46.4,54.8 M95.9,55.6 L46.4,54.8 M150.0,38.0 L110.4,8.3 M204.1,55.6 L189.6,8.3 M237.5,101.6 L253.6,54.8" class="dgm-web" fill="none"/>
  <circle cx="278.0" cy="130.0" r="4.2" class="dgm-n3"/><circle cx="253.6" cy="205.2" r="4.2" class="dgm-n3"/><circle cx="189.6" cy="251.7" r="4.2" class="dgm-n3"/><circle cx="110.4" cy="251.7" r="4.2" class="dgm-n3"/><circle cx="46.4" cy="205.2" r="4.2" class="dgm-n3"/><circle cx="22.0" cy="130.0" r="4.2" class="dgm-n3"/><circle cx="46.4" cy="54.8" r="4.2" class="dgm-n3"/><circle cx="110.4" cy="8.3" r="4.2" class="dgm-n3"/><circle cx="189.6" cy="8.3" r="4.2" class="dgm-n3"/><circle cx="253.6" cy="54.8" r="4.2" class="dgm-n3"/>
  <circle cx="237.5" cy="158.4" r="5.0" class="dgm-n2"/><circle cx="204.1" cy="204.4" r="5.0" class="dgm-n2"/><circle cx="150.0" cy="222.0" r="5.0" class="dgm-n2"/><circle cx="95.9" cy="204.4" r="5.0" class="dgm-n2"/><circle cx="62.5" cy="158.4" r="5.0" class="dgm-n2"/><circle cx="62.5" cy="101.6" r="5.0" class="dgm-n2"/><circle cx="95.9" cy="55.6" r="5.0" class="dgm-n2"/><circle cx="150.0" cy="38.0" r="5.0" class="dgm-n2"/><circle cx="204.1" cy="55.6" r="5.0" class="dgm-n2"/><circle cx="237.5" cy="101.6" r="5.0" class="dgm-n2"/>
  <circle cx="198.0" cy="130.0" r="5.8" class="dgm-n1"/><circle cx="174.0" cy="171.6" r="5.8" class="dgm-n1"/><circle cx="126.0" cy="171.6" r="5.8" class="dgm-n1"/><circle cx="102.0" cy="130.0" r="5.8" class="dgm-n1"/><circle cx="126.0" cy="88.4" r="5.8" class="dgm-n1"/><circle cx="174.0" cy="88.4" r="5.8" class="dgm-n1"/>
  <circle cx="150.0" cy="130.0" r="9.5" class="dgm-hub"/>
  <circle cx="150.0" cy="130.0" r="110" class="dgm-cut" fill="none"/>
  <text x="150.0" y="134.0" text-anchor="middle" class="dgm-hublbl">i</text>
  <g class="dgm-key">
    <circle cx="300" cy="86" r="5.8" class="dgm-n1"/>
    <text x="316" y="90" class="dgm-lbl">1 hop — strong</text>
    <circle cx="300" cy="120" r="5.0" class="dgm-n2"/>
    <text x="316" y="124" class="dgm-lbl">2 hops — weak</text>
    <circle cx="300" cy="154" r="4.2" class="dgm-n3"/>
    <text x="316" y="158" class="dgm-lbl">3 hops — negligible</text>
  </g>
  <text x="300" y="196" class="dgm-em">agent i can ignore</text>
  <text x="300" y="212" class="dgm-em">everything outside</text>
  <text x="300" y="228" class="dgm-em">the dashed ring</text>
</svg>`;

const SVG_FEAS = `<svg viewBox="0 0 420 262" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <defs>
    <marker id="fsA" markerWidth="8" markerHeight="8" refX="6" refY="3.2" orient="auto">
      <path d="M0,0 L6.5,3.2 L0,6.4 Z" class="dgm-fill-mut"/></marker>
    <marker id="fsB" markerWidth="8" markerHeight="8" refX="6" refY="3.2" orient="auto">
      <path d="M0,0 L6.5,3.2 L0,6.4 Z" fill="currentColor"/></marker>
  </defs>
  <path d="M44,142 C38,92 74,54 126,52 C186,49 234,80 236,130
           C238,182 198,218 142,220 C88,222 50,192 44,142 Z"
        class="dgm-region"/>
  <text x="132" y="192" text-anchor="middle" class="dgm-inlbl">feasible</text>
  <text x="140" y="246" text-anchor="middle" class="dgm-lbl">dynamics, safety limits, physics hold</text>

  <circle cx="140" cy="140" r="6" class="dgm-pt"/>
  <text x="140" y="126" text-anchor="middle" class="dgm-lbl">now</text>

  <path d="M148,134 L318,68" class="dgm-mut" fill="none" marker-end="url(#fsA)"/>
  <text x="252" y="30" text-anchor="middle" class="dgm-lbl">what the objective</text>
  <text x="252" y="43" text-anchor="middle" class="dgm-lbl">wants</text>
  <path d="M252,50 L268,84" class="dgm-leader" fill="none"/>

  <circle cx="326" cy="62" r="6.5" class="dgm-ghost"/>
  <path d="M320,56 L332,68 M332,56 L320,68" class="dgm-x" fill="none"/>
  <text x="346" y="66" class="dgm-em">violates</text>

  <path d="M322,76 C312,158 252,182 200,154" class="dgm-corr" fill="none" marker-end="url(#fsB)"/>
  <text x="306" y="200" text-anchor="middle" class="dgm-corr-lbl">correction pulls it back</text>
</svg>`;

const THEMES = [
{
  id:"t1", property:"Coordination", num:"I", color:"currentColor",
  title:"Multi-agent RL through a game-theoretic lens",
  arc:["converges to what?","how good is it?","reach better ones","find them faster","in transport"],
  problem:"When many agents each run their own learning algorithm inside one shared environment, nobody is optimizing the system. Each agent improves its own return, and the environment each one faces keeps moving because the others are learning too. Single-agent guarantees say nothing here. So the first honest question is not how to make this work better — it is what this process actually produces.",
  intuition:SVG_COORD,
  intuitionCap:"Everyone is individually satisfied and the group still did badly. An equilibrium is a claim about stability, not about quality — which is why converging is not the same as succeeding.",
  steps:[
  {
    q:"What do decentralized MARL algorithms actually converge to?",
    findingBrief:"Stationary points <em>are</em> Nash equilibria. Game theory isn't a lens we chose here — it is forced by decentralization.",
    gap:"But nothing in that says the equilibrium reached is any good.",
    tension:[
      "Most MARL theory proves convergence to a first-order stationary point. That is a statement about calculus, not about behaviour. In single-agent RL it is nearly enough, because a stationary point of the policy gradient is a locally optimal policy. With several agents the objective each one climbs depends on what everyone else is doing, so the guarantee floats free of meaning until you can say what a stationary point <em>is</em> in terms of behaviour."
    ],
    finding:[
      "Under direct policy parameterization, first-order stationary policies and Nash equilibria coincide. The two notions are the same set.",
      "That equivalence is why game theory is not an optional framing for this problem. A decentralized learner cannot converge to the best joint policy, because the only configurations its own gradient can recognize as finished are those where <strong>no agent can improve by moving alone</strong>. The joint change that would help everyone is invisible to every individual gradient. This holds even when the agents share one goal and the problem is fully cooperative: the solution concept the algorithm can reach is an equilibrium, and equilibrium is a weaker thing than optimum.",
      "The equivalence is also parameterization-dependent, which matters more than it sounds. Under softmax, policies with zero gradient need not be Nash at all — the gradient can vanish at the boundary of the simplex for reasons that have nothing to do with anyone being satisfied. So the guarantee has to be rebuilt rather than inherited, which we did with finite-time rates; and a unified treatment of Markov games sharpened the rates for zero-sum play and extended them to general-sum."
    ],
    figs:[{ svg:SVG_NASH, drawn:true,
      cap:"Why the reachable set is equilibria rather than optima. At the marked point neither agent gains by changing its own policy, so both stop; the diagonal move that would reach the social optimum requires them to move together, and no individual gradient can see it." }],
    pubs:[
      {t:"Gradient Play in Stochastic Games: Stationary Points, Convergence, and Sample Complexity", v:"IEEE TAC 2024", u:"https://arxiv.org/abs/2106.00198"},
      {t:"On the Global Convergence Rates of Decentralized Softmax Gradient Play in Markov Potential Games", v:"NeurIPS 2022", u:"https://arxiv.org/abs/2202.00872"},
      {t:"Policy Optimization for Markov Games: Unified Framework and Faster Convergence", v:"NeurIPS 2022", u:"https://arxiv.org/abs/2206.02640"}
    ],
    remains:"If the reachable fixed points are equilibria, and a game can have many equilibria with very different social value, then convergence on its own is not an achievement. We need to know how bad the thing we converge to is allowed to be."
  },
  {
    q:"How good or bad can an equilibrium be?",
    findingBrief:"The cost of decentralization splits in two: a sample cost more data can fix, and a welfare cost it never can.",
    gap:"A worst-case bound names the damage but offers no lever on it.",
    tension:[
      "Once you know that decentralized learning lands on <em>an</em> equilibrium, the guarantee you actually want is about welfare, not stationarity. In a game with many equilibria, \"we converged\" is perfectly compatible with \"we converged to something bad,\" and nothing in a convergence proof distinguishes the two."
    ],
    finding:[
      "We extend price-of-anarchy analysis to finite-horizon Markov games in which the dynamics are decoupled across agents but the rewards couple them — the structure you get whenever agents move independently yet share a road, a resource, or a grid. The result bounds how far the worst equilibrium can sit from the social optimum, and pairs that with the sample complexity of reaching an equilibrium at all.",
      "The useful consequence is that the loss from decentralization separates into two budgets that do not trade against each other. One is <strong>statistical</strong>: how many samples to find an equilibrium. The other is <strong>structural</strong>: how much welfare any equilibrium of this game can forfeit. More data closes the first and cannot touch the second.",
      "That distinction changes what you do next. If the price of anarchy is small, invest in learning. If it is large, better learning is the wrong investment — no amount of it will help, and the problem has to be changed rather than solved."
    ],
    figs:[{ src:"figs/poa_welfare.png",
      cap:"Social welfare under decentralized learning (solid) against the achievable optimum (dashed). The curves converge quickly and then stop, well short. That standing gap is not a failure of training and will not close with more of it — it is the structural cost this analysis bounds." }],
    pubs:[{t:"Markov Games with Decoupled Dynamics: Price of Anarchy and Sample Complexity", v:"IEEE CDC 2023", u:"https://arxiv.org/abs/2304.03840"}],
    remains:"A worst-case bound describes the damage without offering a lever. It says nothing about which equilibrium you actually land on, and nothing about how to land on a better one."
  },
  {
    q:"Can we systematically reach better equilibria?",
    findingBrief:"Stop steering toward the good equilibrium; shape the noise so the dynamics live near it, and let selection happen.",
    gap:"Principled, but the noise has to be small to bite — and small noise is slow.",
    tension:[
      "Equilibrium selection is well developed for static games, but those mechanisms assume a fixed payoff matrix to reason over. In a stochastic game the value of a joint action depends on the state it leads to, and that state depends on the joint action. There is no matrix; the object selection arguments operate on does not exist."
    ],
    finding:[
      "We build a framework that lifts selection principles — in particular stochastic stability, where vanishing noise makes some equilibria overwhelmingly more likely over the long run — from normal-form games to stochastic games.",
      "The shift is in where good outcomes come from. Selection stops being a matter of lucky initialization and becomes a property you can put into the learning rule. And you do not have to identify the best equilibrium and drive the system to it: <strong>choose the noise structure so the dynamics spend almost all their time near the equilibria you want</strong>, and the process does the selecting. Quality of outcome becomes part of algorithm design rather than something you audit afterwards."
    ],
    figs:[{ src:"figs/eqsel_goldmine.png",
      cap:"The test case, and a fair picture of the difficulty. Digging together for one step pays 1; committing two steps pays 2 at one location but only 0.5 at the other. Both coordinated behaviours are equilibria, one is twice as good, and reaching it requires both agents to be patient at the same location — so the better equilibrium is the harder one to stumble into." }],
    pubs:[{t:"Equilibrium Selection for Multi-agent Reinforcement Learning: A Unified Framework", v:"arXiv:2406.08844", u:"https://arxiv.org/abs/2406.08844"}],
    remains:"Stochastic stability is an asymptotic argument: the noise must be small for selection to bite, and small noise means slow escape from bad basins. The mechanism is principled and, in practice, too slow."
  },
  {
    q:"Can we discover and select good coordinated behaviours more efficiently?",
    findingBrief:"The real bottleneck is that good joint behaviours are never sampled. Optimism, diversity and signalling change what gets tried.",
    gap:"These questions then arrive in real systems, where the agents are operators.",
    tension:[
      "The binding constraint turns out not to be choosing among equilibria you can see. It is that the good joint behaviours are never <em>sampled</em> in the first place. An action profile that pays well only when several agents each do their part simultaneously has almost no chance of being tried under independent exploration, and its reward is invisible until it is. You cannot select an option you have never observed."
    ],
    finding:[
      "So the lever moves earlier, onto what gets discovered during learning rather than what gets chosen after.",
      "<strong>Optimism, read as risk-seeking.</strong> Instead of judging a joint action by its average outcome, an agent optimistic about its partners evaluates the good tail. This matters because averaging is what destroys the evidence: one successful coordinated attempt gets washed out by all the times the partners did something else. Optimism keeps that single sample legible, which turns coordination from something that must survive averaging into something a lucky draw can reveal.",
      "<strong>Diversity</strong> <em>(ongoing)</em> — holding on to a set of qualitatively different coordinated behaviours instead of collapsing onto the first one that works.",
      "<strong>Signalling</strong> <em>(ongoing)</em> — a shared signal correlates exploration, so agents try complementary things at the same moment instead of independently and pointlessly.",
      "Together these move the question from <em>does decentralized learning converge</em> to <em>can it find good coordination and keep it</em>, which is the version that decides whether any of this is usable."
    ],
    figs:[
      { src:"figs/opt_neutral.png", pair:true,
        cap:"Risk-neutral learning: probability mass splits, much of it settling on the mediocre joint action." },
      { src:"figs/opt_optimistic.png", pair:true,
        cap:"Optimistic learning, same problem: 0.93 of the mass lands on the good joint action." }
    ],
    pubs:[{t:"Optimism as Risk-Seeking in Multi-Agent Reinforcement Learning", v:"IEEE L-CSS 2026", u:"https://arxiv.org/abs/2509.24047"}],
    remains:null
  },
  {
    kind:"application",
    q:"Where this lands: transportation operations and system design",
    findingBrief:"Same structure, real operators: cooperation has to survive individual incentives, so design the incentive rather than the plan.",
    gap:null,
    tension:[
      "Regions, transit authorities and mobility operators share infrastructure and riders but decide separately, and none of them will adopt a plan that costs them. So the useful question is not what a central planner would choose. It is what happens when nobody is central, and what the smallest intervention is that makes a good outcome self-enforcing."
    ],
    finding:[
      "<strong>Co-investment with payoff sharing.</strong> A non-cooperative network-design game combined with cooperative mechanisms, asking when independently operated networks can find cooperation that survives each party's own incentives — the condition under which cooperation is stable rather than merely desirable.",
      "<strong>Implementation-based incentive design.</strong> This inverts the usual order. Rather than choosing a policy and then predicting which equilibrium it induces, start from the operating profile you want and compute the smallest transfer that makes deviating from it unprofitable. You specify the destination and solve for the incentive, instead of specifying the incentive and hoping about the destination."
    ],
    figs:[
      { src:"figs/coinv_zurich.png",
        cap:"Zurich and Winterthur: two independently operated public-transport networks that share riders at their boundary. The strategic problem is not hypothetical — each authority invests on its own budget while the benefits partly land on the other's network." },
      { src:"figs/amod_interaction.png",
        cap:"The interaction being designed: a municipal coordinator can regulate, but an autonomous-mobility operator and a transit operator each choose their own pricing, routing and frequency, and passengers respond to the combination. The coordinator sets incentives, not outcomes." }
    ],
    pubs:[
      {t:"Co-Investment with Payoff-Sharing Mechanism for Cooperative Decision-Making in Network Design Games", v:"arXiv:2508.12059", u:"https://arxiv.org/abs/2508.12059"},
      {t:"Implementation-Based Incentive Design for Autonomous Mobility-on-Demand and Transit Systems", v:"arXiv:2605.18687", u:"https://arxiv.org/abs/2605.18687"}
    ],
    remains:null
  }]
},

{
  id:"t2", property:"Scale", num:"II", color:"currentColor",
  title:"Control and learning for networked systems",
  arc:["what locality costs","locality → scale","other structure"],
  problem:"A power grid, a building, a robot fleet is one globally coupled system, but each controller only sees its own neighbourhood. The standard response is to impose a local structure and optimize inside it — which quietly concedes that something has been given up, without ever saying how much. That missing number is the whole question.",
  intuition:SVG_SCALE,
  intuitionCap:"Influence dies off with distance in the network, so a controller that sees only its own neighbourhood gives up almost nothing — and the decay rate says exactly how much “almost” is.",
  steps:[
  {
    q:"When can decentralized control be nearly as good as centralized control?",
    findingBrief:"Locality isn't a constraint we impose. The globally optimal controller is already local — so truncation is near-exact, not approximate.",
    gap:"Then computing the answer globally and discarding most of it is waste.",
    tension:[
      "Restricting the controller to a local class and optimizing within it tells you the best local controller. It never tells you the price of being local. That price is exactly the number an engineer needs, because it decides whether decentralization is a sound design choice or a resignation dressed up as one."
    ],
    finding:[
      "For network LQR with spatially exponentially decaying dynamics, the <em>globally optimal</em> controller inherits an approximate spatial decay of its own: the optimal gain coupling two agents falls off exponentially with their distance in the network. Truncating it to a κ-hop neighbourhood costs a suboptimality that decays exponentially in κ.",
      "The reframing matters more than the bound. <strong>Locality is not a constraint we impose on the solution — it is a property the solution already has.</strong> Nobody asked for sparsity; it appears because influence in the physical system decays and the optimizer inherits that decay. So a local controller is not a degraded copy of the centralized one. Over a modest neighbourhood it is a near-exact representation of it.",
      "And because the decay rate comes from the physics, it gives a direct exchange rate between communication radius and lost performance. How far agents need to see stops being a modelling choice and becomes a quantity you can read off the system."
    ],
    figs:[
      { src:"figs/sed_heatmap_K.png",
        cap:"The optimal controller gain, plotted as a matrix. No sparsity was imposed and none was asked for; the mass concentrates near the diagonal on its own, which is to say distant agents barely appear in each other's optimal feedback." },
      { src:"figs/sed_thermal_decay.png", pair:true,
        cap:"Strongest coupling remaining between agents at least κ hops apart — five orders of magnitude of decay." },
      { src:"figs/sed_thermal_ratio.png", pair:true,
        cap:"What truncating at κ hops actually costs, falling to 10⁻¹⁰. A few hops buys essentially all of the performance." }
    ],
    pubs:[{t:"Optimal Network Control of Spatially Exponential Decaying Linear Quadratic Regulator", v:"Automatica 2025", u:"https://doi.org/10.1016/j.automatica.2024.112061"}],
    remains:"If the answer we want is already local, then computing it globally and throwing most of it away is waste. The structure should be shaping the algorithm, not just excusing the architecture."
  },
  {
    q:"Can locality be exploited to make learning and control scalable?",
    findingBrief:"Decay runs through the whole pipeline, not just the controller — so complexity tracks the coupling range, not the network size.",
    gap:"But spatial decay is one structure, and a strong assumption.",
    tension:[
      "Learning a controller for an N-agent network nominally means learning an object that grows like N². If distant couplings are provably negligible, then every sample, message and flop spent representing them is spent on nothing. The waste is not incidental; it is what makes these methods stop working at realistic scale."
    ],
    finding:[
      "Decay turns out to propagate through the whole pipeline rather than living only in the controller. Individual value and Q-functions inherit it too, which is what makes local learning legitimate: each agent can fit a critic over its own neighbourhood, and the error from ignoring everyone else is bounded by the same exponential.",
      "That supports a local actor-critic with end-to-end guarantees; local spectral representations that carry the idea to continuous state and action network MDPs; and, when no model is available at all, decentralized zeroth-order policy optimization with consensus, using nothing but local measurements.",
      "The insight underneath is that <strong>exponential decay converts one global estimation problem into many local ones with a quantified seam</strong>. Because the bound depends on the coupling range and not on N, the same algorithm and the same guarantee apply at ten agents and at a thousand."
    ],
    figs:[
      { src:"figs/zodpo_struct1.png",
        cap:"What decentralization actually imposes: each agent's input is formed from only its own block of the state. The question of the previous panel was whether the optimal controller respects this shape — it approximately does." },
      { src:"figs/zodpo_4zone.png",
        cap:"A multi-zone HVAC system, one of the settings this targets. Thermally coupled zones on a shared air handling unit: coupling is genuine but local, which is exactly the structure being exploited." }
    ],
    pubs:[
      {t:"Scalable Reinforcement Learning for Linear-Quadratic Control of Networks", v:"ACC 2024", u:"https://arxiv.org/abs/2401.16183"},
      {t:"Scalable Spectral Representations for Multi-Agent Reinforcement Learning in Network MDPs", v:"AISTATS 2025", u:"https://arxiv.org/abs/2410.17221"},
      {t:"Distributed Reinforcement Learning for Decentralized Linear Quadratic Control: A Derivative-Free Policy Optimization Approach", v:"IEEE TAC 2022", u:"https://arxiv.org/abs/1912.09135"}
    ],
    remains:"Spatial decay is a strong assumption, and one structure among many. Plenty of real systems have no such decay yet are far from unstructured — sparse interaction, symmetry, separated timescales, or a short horizon over which agents can affect each other at all."
  },
  {
    q:"What other structures can be turned into algorithmic efficiency?",
    findingBrief:"Each hard problem becomes tractable through one structural fact that makes distant things provably irrelevant. Find it, stop paying for them.",
    gap:null,
    tension:[
      "Every problem in this group is intractable at scale in its general form, and every one of them becomes tractable because of a specific structural fact about it. The recurring engineering question is which fact, and how to convert it into a smaller computation without giving up the guarantee."
    ],
    finding:[
      "<strong>Communication over a graph → exploration.</strong> When agents have to physically travel to sample, exploration cost is set by graph distance and not only by uncertainty, so regret depends on topology. Where you can cheaply get to next is part of the learning problem.",
      "<strong>Transients → coverage control.</strong> Agents must learn an unknown spatial density while travelling through it. Optimizing the final configuration ignores that the journey is most of the cost, so the transient belongs in the objective rather than being tidied away.",
      "<strong>Bounded interaction horizon → factorization in path finding.</strong> Over a short horizon most robots simply cannot reach one another, so they cannot possibly conflict. Reachability turns one enormous coupled planning problem into a handful of small independent ones, re-formed at every step. Two refinements follow: a single conflict tree reused as the horizon grows, so extra computation deepens the existing search instead of restarting it, and certificate trajectories that recover global guarantees while letting the factorization be inherited over time.",
      "<strong>Physical dynamics → building control</strong>, with multi-timescale learned models inside MPC; and <strong>topology → power-grid control</strong> <em>(ongoing)</em>.",
      "The principle across all of them: find the structure that makes distant things provably irrelevant, then stop paying for them."
    ],
    figs:[
      { src:"figs/fico_grouping.png",
        cap:"Factorization by reachability. Grey robots cannot reach a conflict within the horizon and are exempt from replanning; only the coloured groups need joint reasoning. This is the whole trick — one intractable coupled problem replaced by several small ones, recomputed each step." },
      { src:"figs/accbs_tree.png",
        cap:"One conflict tree, reused as the planning horizon grows from 1 to 5 (colours mark successive stages). Because the tree is inherited rather than rebuilt, more available computation deepens the same search — the algorithm degrades gracefully into whatever time budget it is given." }
    ],
    pubs:[
      {t:"FICO: Finite-Horizon Closed-Loop Factorization for Unified Multi-Agent Path Finding", v:"arXiv:2511.13961", u:"https://arxiv.org/abs/2511.13961"},
      {t:"Adaptive-Horizon Conflict-Based Search for Closed-Loop Multi-Agent Path Finding", v:"IEEE RA-L 2026", u:"https://arxiv.org/abs/2602.12024"},
      {t:"Certificate-Driven Closed-Loop Multi-Agent Path Finding with Inheritable Factorization", v:"IEEE CDC 2026", u:"https://arxiv.org/abs/2604.00428"},
      {t:"Cooperative Multi-Agent Graph Bandits: UCB Algorithm and Regret Analysis", v:"ACC 2024", u:"https://arxiv.org/abs/2401.10383"},
      {t:"Multi-Agent Coverage Control with Transient Behavior Consideration", v:"L4DC 2024", u:"https://arxiv.org/abs/2404.05995"},
      {t:"Adaptive Model Predictive Control with Ensembled Multi-Time Scale Deep-Learning Models for Smart Control of Natural Ventilation", v:"Building and Environment 2023", u:"https://www.sciencedirect.com/science/article/pii/S0360132323005462"}
    ],
    remains:null
  }]
},

{
  id:"t3", property:"Feasibility", num:"III", color:"currentColor",
  title:"Robustness, safety, and feasibility",
  arc:["uncertain models","hard requirements","no derivatives","no equation at all"],
  problem:"Deployed systems run on models that are wrong and under requirements that are not negotiable. Performance can be traded away; the dynamics, the safety limits and physical feasibility cannot. So the question is how to keep optimizing without breaking the things that make a solution a solution at all — and the answer changes as our access to those requirements gets weaker.",
  intuition:SVG_FEAS,
  intuitionCap:"The step the objective wants points out of the safe set, so something has to pull it back. What changes across this theme is how much we actually know about where the boundary is.",
  steps:[
  {
    q:"How should an agent decide when the model is uncertain?",
    findingBrief:"Robustness to a wrong model and risk-aversion about outcomes are the same act — which makes robustness computable.",
    gap:"But robustness degrades gracefully; some requirements can't degrade at all.",
    tension:[
      "A policy optimized against a nominal model can be excellent on that model and unusable on the real system. Robust formulations answer this by optimizing the worst case over an uncertainty set, but they tend to be intractable, and the worst case can be so conservative that the resulting policy is not worth deploying either."
    ],
    finding:[
      "A class of soft robust MDPs is <em>equivalent</em> to a class of risk-sensitive MDPs. Two literatures with unrelated motivations — one about adversarial model error, the other about attitude toward randomness — turn out to be describing the same objects.",
      "Practically, that equivalence is what makes robustness computable: robust questions inherit risk-sensitive machinery, so policy-gradient methods and sample-complexity results transfer, none of which the min-max formulation gives up easily.",
      "Conceptually it says something sharper. <strong>Hedging against a misspecified model and being risk-averse about outcomes are the same act.</strong> There is one dial rather than two vocabularies, tuning the risk parameter is choosing an uncertainty radius, and the tradeoff you are actually making becomes visible instead of being buried in the choice of formulation."
    ],
    figs:[{ src:"figs/softrobust_robustness.png",
      cap:"The tradeoff made explicit. As the model drifts by δ, the risk-neutral policy starts best and falls fastest; risk-sensitive policies give up nominal performance for a far flatter curve. The parameter β selects a point on this family — which is the choice being made whether or not anyone states it." }],
    pubs:[{t:"Soft Robust MDPs and Risk-Sensitive MDPs: Equivalence, Policy Gradient, and Sample Complexity", v:"ICLR 2024", u:"https://arxiv.org/abs/2306.11626"}],
    remains:"Robustness is about degrading gracefully — buying expected performance under a worse model. Many requirements are not like that at all. A trajectory that violates the dynamics is not a worse solution; it is not a solution."
  },
  {
    q:"How do we optimize performance while preserving feasibility?",
    findingBrief:"Treat violation as an output and regulate it to zero. You specify a decay rate instead of guessing a penalty weight.",
    gap:"This needs constraint derivatives — and often we can only evaluate.",
    tension:[
      "Penalty methods convert a hard requirement into a term in the objective and leave you tuning a weight: too small and the constraint is violated, too large and progress stalls, and the right value moves as the optimization proceeds. Projection needs a projection you can actually compute. Neither approach lets you say anything about how violation behaves over time — which is the only thing you wanted to control."
    ],
    finding:[
      "Treat constraint violation as the output of a dynamical system and <strong>regulate it to zero</strong>. The optimizer becomes a feedback controller whose job is to drive the residual down while descending the objective, and feedback linearization supplies the update.",
      "From that view: convergence to KKT points, a clean relationship to SQP, a natural extension from equality to inequality constraints, and momentum-based acceleration. The same idea transfers to hard-constrained physics-informed network training, where PDE and boundary residuals are regulated rather than weighted.",
      "The gain is in what you are asked to specify. A penalty weight has no units and no interpretation; <strong>a decay rate says how fast infeasibility should die</strong>, which is a thing an engineer can state and defend. Constraint satisfaction stops being a hope about the final iterate and becomes a stability property of the optimizer."
    ],
    figs:[{ svg:SVG_REGULATE, drawn:true,
      cap:"The optimizer as a feedback loop: the objective proposes a step, the constraint residual is measured, and the update is corrected so that residual decays at a rate you choose (right). The three curves are three choices of that rate — the parameter you set, in place of a penalty weight." }],
    pubs:[
      {t:"Constrained Optimization From a Control Perspective via Feedback Linearization", v:"NeurIPS 2025", u:"https://arxiv.org/abs/2503.12665"},
      {t:"AdamFLIP: Adaptive Momentum Feedback Linearization Optimization for Hard-Constrained PINN Training", v:"arXiv:2605.08408", u:"https://arxiv.org/abs/2605.08408"}
    ],
    remains:"All of this needs derivatives of the constraint. Very often you can only evaluate feasibility — through a simulator, a legacy solver, a physical test. The requirement is still explicit; our access to it is not."
  },
  {
    q:"How do we enforce constraints with only black-box access?",
    findingBrief:"With weaker access, stop asking for the best step and ask for a reliably feasible one. Randomization makes that affordable.",
    gap:"And sometimes there is no constraint function to query at all.",
    tension:[
      "Estimating gradients from evaluations is noisy and expensive, and the cost grows with dimension. Worse, feeding noisy estimates into a constrained method breaks precisely the guarantee you were buying: the correction step is itself uncertain, so violation can grow rather than shrink, and the failure is not visible from the objective value."
    ],
    finding:[
      "Two directions. <strong>Zeroth-order feedback linearization</strong> keeps the regulate-the-violation idea using only function evaluations, with estimation error carried through the analysis so that violation stays under explicit control instead of being assumed small. <strong>Random-subspace SQP</strong> performs each step inside a randomly drawn low-dimensional subspace, so per-iteration cost scales with the subspace dimension rather than the ambient one — you buy progress in a random slice and rely on the slice rotating over iterations for coverage.",
      "The shift in goal is the point. <strong>With weaker access you stop asking for the best step and ask for a reliably feasible one.</strong> Randomization is what makes high-dimensional black-box constraints affordable at all; the control view is what stops randomization from destroying feasibility on the way."
    ],
    figs:[{ src:"figs/sqp_theta.png",
      cap:"A power-system fault, with and without the constraint enforced. Top: generator angles under the constrained solution, staying inside their separation limit. Bottom: a solution that reaches a comparable objective while ignoring that limit, swinging roughly twice as far. Both look like success in the objective value; only one is operable." }],
    pubs:[
      {t:"Zeroth-Order Constrained Optimization from a Control Perspective via Feedback Linearization", v:"arXiv:2509.24056", u:"https://arxiv.org/abs/2509.24056"},
      {t:"Random-Subspace Sequential Quadratic Programming for Constrained Zeroth-Order Optimization", v:"IEEE CDC 2026", u:"https://arxiv.org/abs/2604.02202"}
    ],
    remains:"Sometimes there is no constraint function to query at all. What counts as feasible is known only through examples of feasible behaviour."
  },
  {
    q:"How do we optimize when the feasible set is only implicit?",
    findingBrief:"The denoiser is already an approximate projection onto feasibility. Use it as the correction step.",
    gap:null,
    tension:[
      "A diffusion model trained on feasible trajectories captures what plausible behaviour looks like, but exposes no equation, no residual, nothing to evaluate. At test time we want to impose a new objective while staying inside that learned set.",
      "Standard gradient guidance computes the task gradient in ambient trajectory space, and that direction generally points off the learned manifold — so improving the objective quietly destroys dynamic feasibility. The failure mode is the dangerous kind: the output still looks like a trajectory, and is not one."
    ],
    finding:[
      "Read diffusion planning as constrained optimization whose feasible set is represented implicitly by the generative model, and use the denoiser as the feasibility correction. The gradient step improves the objective; denoising pulls the result back toward what the data says is feasible.",
      "What makes this more than an analogy is that <strong>the denoiser is already an approximate projection onto the data manifold</strong> — that is what training taught it to be. So the operator that played \"constraint residual\" in the explicit case, and \"estimated residual\" in the black-box case, is available for free in the regime where feasibility exists only as data.",
      "That completes the arc of the theme: <em>explicit and differentiable</em> — regulate the residual; <em>explicit but black-box</em> — estimate and regulate under noise; <em>implicit in data</em> — let the denoiser do the correcting. Our access to feasibility weakens at every step, and the job never changes."
    ],
    figs:[{ svg:SVG_DIFFUSION, drawn:true, ongoing:true,
      cap:"The mechanism, drawn rather than measured — this work is in progress. The task gradient leaves the manifold of trajectories the model learned to call feasible; the denoiser plays the role that an explicit constraint residual played earlier in the theme." }],
    pubs:[
      {t:"Denoising as Projection: Constrained Optimization with Gradient-Guided Diffusion", v:"arXiv:2608.29507", u:"https://arxiv.org/abs/2608.29507"}
    ],
    remains:null
  }]
}];

const PROFILE = {
  name:"Runyu (Cathy) Zhang",
  role:"Postdoc for Engineering Excellence, MIT",
  email:"runyuzha@mit.edu",
  site:"https://runyu-cathy-zhang.github.io/",
  scholar:"https://scholar.google.com/citations?hl=en&user=rLeH1NgAAAAJ",
  cv:"https://runyu-cathy-zhang.github.io/files/cathy-cv.pdf?v=89f1596c"
};


/* ============================================================
   v3 additions: the thesis, how the themes compose,
   where it runs, and where it is going.
   ============================================================ */

const THESIS = {
  headline: "Autonomy is arriving as a crowd.",
  paras: [
    "Grids are being asked to reconfigure themselves. Warehouses run hundreds of robots at once. Buildings, vehicle fleets and transit systems are each turning into many decision-makers sharing one piece of physics. Almost none of the theory we rely on was built for that: it was built for one agent, one objective, full information.",
    "I build the theory for the version that is actually arriving. Before a system of many learning agents can be trusted with anything consequential, three things have to be true at the same time. The agents have to settle on outcomes we would have chosen. That coordination has to survive being large. And none of it may violate the physics or the safety limits.",
    "Those three requirements are the three themes below. They are not three interests I happen to have — they are three conditions on one goal, and the problems I find most worth doing are the ones that need two or three of them at once."
  ],
  question: "How do we better orchestrate complex systems with multiple interacting agents and components?"
};

/* --- how the three themes compose --- */




const SVG_APP_GRID = `
<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <path d="M32,42 L82,26 M82,26 L132,46 M132,46 L172,30 M32,42 L56,96 M104,110 L160,94 M82,26 L104,110 M132,46 L160,94"
        class="dgm-web" fill="none"/>
  <path d="M56,96 L104,110" class="dgm-cutline" fill="none"/>
  <g class="dgm-node"><circle cx="32" cy="42" r="5"/><circle cx="82" cy="26" r="5"/>
    <circle cx="132" cy="46" r="5"/><circle cx="172" cy="30" r="5"/><circle cx="56" cy="96" r="5"/>
    <circle cx="104" cy="110" r="5"/><circle cx="160" cy="94" r="5"/></g>
  <text x="72" y="132" class="dgm-glbl-a">line switched out</text>
</svg>`;

const SVG_APP_FLEET = `
<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <g class="dgm-grid-dots">
    <circle cx="26" cy="26" r="1.8"/><circle cx="48" cy="26" r="1.8"/><circle cx="70" cy="26" r="1.8"/><circle cx="92" cy="26" r="1.8"/><circle cx="114" cy="26" r="1.8"/><circle cx="136" cy="26" r="1.8"/><circle cx="158" cy="26" r="1.8"/><circle cx="180" cy="26" r="1.8"/>
    <circle cx="26" cy="48" r="1.8"/><circle cx="48" cy="48" r="1.8"/><circle cx="70" cy="48" r="1.8"/><circle cx="92" cy="48" r="1.8"/><circle cx="114" cy="48" r="1.8"/><circle cx="136" cy="48" r="1.8"/><circle cx="158" cy="48" r="1.8"/><circle cx="180" cy="48" r="1.8"/>
    <circle cx="26" cy="70" r="1.8"/><circle cx="48" cy="70" r="1.8"/><circle cx="70" cy="70" r="1.8"/><circle cx="92" cy="70" r="1.8"/><circle cx="114" cy="70" r="1.8"/><circle cx="136" cy="70" r="1.8"/><circle cx="158" cy="70" r="1.8"/><circle cx="180" cy="70" r="1.8"/>
    <circle cx="26" cy="92" r="1.8"/><circle cx="48" cy="92" r="1.8"/><circle cx="70" cy="92" r="1.8"/><circle cx="92" cy="92" r="1.8"/><circle cx="114" cy="92" r="1.8"/><circle cx="136" cy="92" r="1.8"/><circle cx="158" cy="92" r="1.8"/><circle cx="180" cy="92" r="1.8"/>
  </g>
  <rect x="36" y="16" width="68" height="42" rx="3" class="dgm-group" fill="none"/>
  <rect x="126" y="60" width="66" height="42" rx="3" class="dgm-group" fill="none"/>
  <g fill="none" class="dgm-path"><path d="M48,26 L92,26 L92,48"/><path d="M180,92 L136,92 L136,70"/></g>
  <g class="dgm-node"><circle cx="48" cy="26" r="4"/><circle cx="180" cy="92" r="4"/></g>
  <text x="36" y="124" class="dgm-glbl">groups that cannot interact</text>
</svg>`;

const SVG_APP_BUILDING = `
<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <circle cx="170" cy="22" r="8" class="dgm-sun" fill="none"/>
  <path d="M170,8 V2 M170,42 V36 M156,22 H150 M184,22 H190 M160,12 L156,8 M180,32 L184,36"
        class="dgm-sun" fill="none"/>
  <rect x="26" y="34" width="126" height="80" class="dgm-shell"/>
  <path d="M89,34 V114 M26,74 H152" class="dgm-shell-div" fill="none"/>
  <g class="dgm-flowline" fill="none">
    <path d="M34,54 C50,48 62,60 80,54"/><path d="M97,54 C113,48 125,60 143,54"/>
    <path d="M34,94 C50,88 62,100 80,94"/>
  </g>
  <text x="26" y="132" class="dgm-glbl">hours of thermal mass, minutes of weather</text>
</svg>`;

const SVG_APP_MOBILITY = `
<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" class="dgm">
  <path d="M30,42 L58,78 M58,78 L28,102 M30,42 L28,102 M152,38 L174,76 M174,76 L146,102 M152,38 L146,102"
        class="dgm-web" fill="none"/>
  <path d="M58,78 L146,102" class="dgm-bridge" fill="none"/>
  <g class="dgm-node"><circle cx="30" cy="42" r="5"/><circle cx="58" cy="78" r="5"/><circle cx="28" cy="102" r="5"/></g>
  <g class="dgm-node-b"><circle cx="152" cy="38" r="5"/><circle cx="174" cy="76" r="5"/><circle cx="146" cy="102" r="5"/></g>
  <text x="70" y="58" class="dgm-glbl-a">shared riders,</text>
  <text x="70" y="70" class="dgm-glbl-a">separate budgets</text>
  <text x="24" y="128" class="dgm-glbl">two operators, one corridor</text>
</svg>`;

const APPLICATIONS = {
  headline: "Where this has to work",
  lead: "These are not illustrations chosen after the fact. Each one is a system whose particular difficulty forced one of the questions above.",
  items: [
    { svg: SVG_APP_GRID, name: "Power grids",
      stake: "Topology control changes which lines carry power. It can make a grid more resilient — and it silently rewrites what every local controller is allowed to do. Reconfiguration and control cannot be designed separately.",
      theme: "II &amp; III" },
    { svg: SVG_APP_FLEET, name: "Robot fleets",
      stake: "Hundreds of robots, a decision every few hundred milliseconds, and a collision is not a worse solution — it is not a solution. Everything here is a race between how far ahead you look and how long you are allowed to think.",
      theme: "II" },
    { svg: SVG_APP_BUILDING, name: "Buildings",
      stake: "Thermal mass moves over hours; occupancy and weather move over minutes. Control that ignores either timescale either wastes energy or makes the room unusable — and the model is always somewhat wrong.",
      theme: "II &amp; III" },
    { svg: SVG_APP_MOBILITY, name: "Mobility and transit",
      stake: "Operators who share riders and roads but not budgets. Nothing gets adopted because it is socially optimal; it gets adopted because deviating from it costs more than going along with it.",
      theme: "I" }
  ]
};

/* --- where it is going --- */
const SVG_FUTURE = `
<svg viewBox="0 0 700 330" xmlns="http://www.w3.org/2000/svg" class="dgm dgm-wide">
  <defs>
    <marker id="fu1" markerWidth="9" markerHeight="9" refX="6.5" refY="3.6" orient="auto">
      <path d="M0,0 L7.5,3.6 L0,7.2 Z" class="dgm-fill-mut"/></marker>
  </defs>
  <text x="16" y="52" class="dgm-t1lbl">I &#183; COORDINATION</text>
  <text x="16" y="169" class="dgm-t2lbl">II &#183; SCALE</text>
  <text x="16" y="286" class="dgm-t3lbl">III &#183; FEASIBILITY</text>
  <g fill="none" stroke-width="1.7" marker-end="url(#fu1)">
    <path d="M156,48 C232,48 246,120 292,140" class="dgm-t1line"/>
    <path d="M156,165 L292,165" class="dgm-t2line"/>
    <path d="M156,282 C232,282 246,210 292,190" class="dgm-t3line"/>
  </g>
  <rect x="300" y="126" width="140" height="78" rx="4" class="dgm-hubbox"/>
  <text x="370" y="151" text-anchor="middle" class="dgm-hubtxt">many AI systems</text>
  <text x="370" y="169" text-anchor="middle" class="dgm-hubtxt">deciding together</text>
  <text x="370" y="190" text-anchor="middle" class="dgm-hubsub">all three at once</text>
  <g fill="none" class="dgm-mut" stroke-width="1.4" marker-end="url(#fu1)">
    <path d="M440,146 C476,146 484,74 508,64"/><path d="M440,165 L508,165"/>
    <path d="M440,184 C476,184 484,256 508,266"/>
  </g>
  <g class="dgm-outbox">
    <rect x="514" y="44" width="172" height="42" rx="3"/>
    <rect x="514" y="145" width="172" height="42" rx="3"/>
    <rect x="514" y="246" width="172" height="42" rx="3"/>
  </g>
  <g class="dgm-outtxt">
    <text x="600" y="61" text-anchor="middle">agents propose,</text>
    <text x="600" y="77" text-anchor="middle">control certifies</text>
    <text x="600" y="162" text-anchor="middle">protocols against</text>
    <text x="600" y="178" text-anchor="middle">groupthink</text>
    <text x="600" y="263" text-anchor="middle">guarantees that</text>
    <text x="600" y="279" text-anchor="middle">compose</text>
  </g>
</svg>`;

const FUTURE = {
  headline: "What I want to build next",
  lead: "A collection of capable agents is not a reliable decision system.",
  paras: [
    "Put several strong AI systems on one decision and they will duplicate each other's work, agree far too readily, and — the part that actually worries me — confidently produce a plan that violates a constraint nobody thought to write down. Every one of those failure modes is one I have already met somewhere else: agents converging on a poor equilibrium; computation that does not survive scale; an objective improved by quietly breaking feasibility.",
    "So I do not think multi-AI collaboration is a new field. I think it is this same problem arriving at a new scale, and it is simultaneously a coordination problem, a scale problem and a feasibility problem. That intersection is precisely where the three themes were built to meet."
  ],
  bets: [
    { n:"01", t:"Reasoning-guided optimization and control",
      d:"Let language models propose the decomposition, the objective, the policy class, the solver strategy — and let optimization and control layers refine what is workable and certify what is safe. The proposal and the guarantee come from different places, deliberately, because the thing that is good at generating options is not the thing that should be trusted to approve them." },
    { n:"02", t:"Interaction design for AI collectives",
      d:"Communication and signalling protocols that divide labour, resist premature agreement, and keep a genuinely diverse set of candidate plans alive long enough to be compared. This is equilibrium selection and signalling again — with agents that can talk to each other." },
    { n:"03", t:"Guarantees that compose",
      d:"The one I care about most. Approximation error from a localized policy, feasibility error from a learned correction, coordination loss from imperfect signalling: I want to know how these propagate across an interface, so that a guarantee about a module means something about the whole architecture. Without it, every deployed system is a pile of separately tuned parts and we are guessing." }
  ],
  closing: "Across power systems, mobility, buildings and robot fleets the goal is the same — collective intelligence that comes with a guarantee. I would rather have a system whose limits I can state precisely than one that merely performs well in the demo."
};


/* ============================================================
   BELOW THIS LINE IS GENERATED FROM COPY-motivation.md
   by build-copy.py — do not hand-edit; edit the markdown.
   ============================================================ */

/* Figures were removed from the question cards at the author's request. */
THEMES.forEach(t => t.steps.forEach(s => { s.figs = []; }));
const MOTIVATION = {"title": "Collective intelligence, with guarantees", "titleSrc": "motivation_and_plate0.md:3-3", "question": "How can we better orchestrate complex systems with multiple interacting agents and components?", "questionSrc": "motivation_and_plate0.md:9-9", "opening": [{"t": "Everything I work on circles around this one question.", "s": "motivation_and_plate0.md:15-15"}, {"t": "It is a bit of a cliché for a researcher to tell you their question is important. But I'll say it anyway, because I think this one really is! It appears in many of the complex systems and infrastructures we interact with every day. For example:", "s": "motivation_and_plate0.md:17-17"}], "examples": [{"name": "Warehouse robotics", "text": "Hundreds of robots must operate safely and efficiently in the same shared space.", "src": "motivation_and_plate0.md:25-25", "nameSrc": "motivation_and_plate0.md:23-23", "img": "figs/key_figs/warehouse-robot.gif", "source": "<a href=\"https://www.aboutamazon.com/news/operations/amazon-robotics-robots-fulfillment-center\" target=\"_blank\">Amazon Robotics</a>", "sourceSrc": "motivation_and_plate0.md:27-27"}, {"name": "Mobility and transit", "text": "Travelers, transit operators, and municipalities all make their own decisions over the same transportation network.", "src": "motivation_and_plate0.md:31-31", "nameSrc": "motivation_and_plate0.md:29-29", "img": "figs/key_figs/mobility-system.png", "source": null, "sourceSrc": null}, {"name": "Power grids", "text": "Generation, storage, and demand are tightly coupled and constantly changing.", "src": "motivation_and_plate0.md:35-35", "nameSrc": "motivation_and_plate0.md:33-33", "img": "figs/key_figs/power-grid.png", "source": "<a href=\"https://www.mdpi.com/2076-3417/16/7/3479\" target=\"_blank\">Hydrogen-powered data centres</a>", "sourceSrc": "motivation_and_plate0.md:37-37"}, {"name": "Multi-agent AI", "text": "AI agents increasingly need to communicate, reason, coordinate, and act together.", "src": "motivation_and_plate0.md:41-41", "nameSrc": "motivation_and_plate0.md:39-39", "img": "figs/key_figs/multi-LLM-agent.png", "source": null, "sourceSrc": null}], "unites": "These systems look very different on the surface, but underneath they share a common structure: many components interact through a shared environment, each has only a partial view of the system, their decisions affect one another, and they must operate despite imperfect models and hard physical or operational constraints. Across them, three challenges keep reappearing. They are what my research is organized around.", "unitesSrc": "motivation_and_plate0.md:45-45", "challenges": [{"name": "Limited communication and observation", "text": "No agent sees the whole system, and communicating everything to everyone is often impossible.", "src": "motivation_and_plate0.md:49-49", "nameSrc": "motivation_and_plate0.md:47-47"}, {"name": "Strategic interaction and misaligned incentives", "text": "When agents pursue their own objectives, individually rational decisions need not produce a desirable collective outcome.", "src": "motivation_and_plate0.md:53-53", "nameSrc": "motivation_and_plate0.md:51-51"}, {"name": "Imperfect models and hard constraints", "text": "Decisions must remain reliable under imperfect models while still satisfying hard safety and feasibility constraints.", "src": "motivation_and_plate0.md:57-57", "nameSrc": "motivation_and_plate0.md:55-55"}]};
const METHOD_TEXT = "My work sits at the intersection of classical control theory, game theory, and optimization, together with newer tools such as reinforcement learning, diffusion models, and language models. I strongly believe in being problem-first rather than tool-first: which hammer to use should depend on the problem.";
const METHOD_SRC = "motivation_and_plate0.md:63-63";
const OVERVIEW = {"heading": "Overview & Roadmap", "headingSrc": "motivation_and_plate0.md:70-70", "intro": "My research is organized around three recurring challenges in complex multi-agent systems, with each motivating a major research direction:", "introSrc": "motivation_and_plate0.md:72-72", "map": [{"challenge": "Limited communication and observation", "direction": "Control and Learning for Networked Systems", "challengeSrc": "motivation_and_plate0.md:74-74", "directionSrc": "motivation_and_plate0.md:75-75"}, {"challenge": "Strategic interaction and misaligned incentives", "direction": "Multi-Agent Learning through a Game-Theoretic Lens", "challengeSrc": "motivation_and_plate0.md:77-77", "directionSrc": "motivation_and_plate0.md:78-78"}, {"challenge": "Imperfect models and hard constraints", "direction": "Robust and Feasible Decision-Making under Uncertainty", "challengeSrc": "motivation_and_plate0.md:80-80", "directionSrc": "motivation_and_plate0.md:81-81"}], "boxes": [{"name": "Control and Learning for Networked Systems", "text": "Many complex systems are naturally embedded in a network or graph structure. My research asks how we can leverage this structure to design control and learning algorithms that are more scalable, communication-efficient, and data-efficient.", "src": "motivation_and_plate0.md:87-87"}, {"name": "Multi-Agent Learning through a Game-Theoretic Lens", "text": "In complex multi-agent systems, agents may have different incentives. My research studies how agents can reach efficient equilibria efficiently, and, when multiple equilibria exist, how we can steer learning toward outcomes that are better for the system as a whole.", "src": "motivation_and_plate0.md:91-91"}, {"name": "Robust and Feasible Decision-Making under Uncertainty", "text": "Our decisions need to remain reliable despite modeling errors and uncertainty, while also satisfying operational, feasibility, and safety constraints. These requirements become especially challenging in data-driven settings. My research aims to incorporate them into learning and decision-making in a principled way, with theoretical guarantees.", "src": "motivation_and_plate0.md:95-95"}]};

/* Names, order and box copy come from the markdown's roadmap. Existing figures
   and publication lists are preserved. */
(function () {
  const DIRS = ["Control and Learning for Networked Systems", "Multi-Agent Learning through a Game-Theoretic Lens", "Robust and Feasible Decision-Making under Uncertainty"];
  const DIRSRC = ["motivation_and_plate0.md:75-75", "motivation_and_plate0.md:78-78", "motivation_and_plate0.md:81-81"];
  const BOXES = [{"name": "Control and Learning for Networked Systems", "text": "Many complex systems are naturally embedded in a network or graph structure. My research asks how we can leverage this structure to design control and learning algorithms that are more scalable, communication-efficient, and data-efficient.", "src": "motivation_and_plate0.md:87-87"}, {"name": "Multi-Agent Learning through a Game-Theoretic Lens", "text": "In complex multi-agent systems, agents may have different incentives. My research studies how agents can reach efficient equilibria efficiently, and, when multiple equilibria exist, how we can steer learning toward outcomes that are better for the system as a whole.", "src": "motivation_and_plate0.md:91-91"}, {"name": "Robust and Feasible Decision-Making under Uncertainty", "text": "Our decisions need to remain reliable despite modeling errors and uncertainty, while also satisfying operational, feasibility, and safety constraints. These requirements become especially challenging in data-driven settings. My research aims to incorporate them into learning and decision-making in a principled way, with theoretical guarantees.", "src": "motivation_and_plate0.md:95-95"}];
  const byName = {
    "Control and Learning for Networked Systems": "t2",
    "Multi-Agent Learning through a Game-Theoretic Lens": "t1",
    "Robust and Feasible Decision-Making under Uncertainty": "t3"
  };
  const byId = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const NUM = ["1", "2", "3"];
  const ordered = [];
  DIRS.forEach((name, i) => {
    const th = byId[byName[name]];
    if (!th) return;
    th.property = name;
    th.propertySrc = (DIRSRC[i] || null);
    th.title = "";                       // the full name replaces the old subtitle
    th.num = NUM[i];
    th.label = "Theme " + NUM[i];
    const box = BOXES.find(b => b.name === name);
    if (box) { th.intuitionCap = box.text; th.intuitionCapSrc = box.src; }
    th.intuitionImg = "figs/key_figs/theme" + NUM[i] + "-illustration.png";
    ordered.push(th);
  });
  THEMES.length = 0;
  ordered.forEach(t => THEMES.push(t));
})();

/* Themes rewritten in plate*.md. Question text, body copy and "what remains"
   come from the markdown; publications are retained for the reference list
   (they are hidden inside a card whose prose already links them). */
(function () {
  const SRCS = [{"name": "Control and Learning for Networked Systems", "problemHtml": "<p data-src=\"plate1.md:3-3\"><strong>Problem:</strong> Large networked systems are globally coupled, while sensing, communication, and computation are inherently local. In practice, no agent has access to the entire system, and fully centralized solutions quickly become difficult to implement or learn as the network grows. This tension between <strong>global performance and local information</strong> is where much of my work in networked control and learning begins.</p><p data-src=\"plate1.md:5-5\">When information is inherently local, a natural approach is distributed control, where each agent makes decisions using only the information available within its local neighborhood.</p>", "steps": [{"q": "When can distributed control be nearly as good as centralized control?", "kind": null, "qSrc": "plate1.md:7-7", "brief": "We find that the optimal controller is already approximately local, with a provable bound on the loss from localizing it.", "briefSrc": "plate1.md:9-9", "remainsSrc": "plate1.md:20-20", "html": "<p data-src=\"plate1.md:11-11\">Distributed control has a long history, however, much of the literature focuses on finding the best controller within a prescribed distributed class. But a more fundamental question has received comparatively less attention: <strong>how much performance do we lose relative to the globally optimal centralized controller?</strong></p><p data-src=\"plate1.md:13-13\"><strong>Finding:</strong> In <a href=\"https://arxiv.org/abs/2209.14376\" target=\"_blank\"><em>On the Optimal Control of Network LQR with Spatially-Exponential Decaying Structure</em></a>, we show that when the underlying networked dynamics exhibit suitable spatial decay, the globally optimal LQR controller itself inherits an approximately spatially decaying structure. As a result, it can be well approximated by a localized controller, with a rigorous bound on the resulting performance loss.</p><figure class=\"pfig\" data-fig=\"sed_lqr_spatial_decay.png\" data-src=\"plate1.md:15-15\"><img src=\"figs/key_figs/sed_lqr_spatial_decay.png\" alt=\"\" data-cap=\"\" data-fig=\"sed_lqr_spatial_decay.png\"></figure><p data-src=\"plate1.md:18-18\">What I find most interesting about this result is that locality is not merely a restriction we impose to make control implementable. <strong>Under the right system structure, locality is already present in the globally optimal solution.</strong></p>", "remains": "If the optimal solution itself has approximate locality, can we exploit this structure not only for decentralized control, but also to make learning more scalable?", "figs": []}, {"q": "Can locality be exploited to make learning and control scalable?", "kind": null, "qSrc": "plate1.md:24-24", "brief": "Locality carries over to value functions, giving learning algorithms that scale with local interactions rather than network size.", "briefSrc": "plate1.md:26-26", "remainsSrc": "plate1.md:40-40", "html": "<p data-src=\"plate1.md:28-28\">Building on our work from the previous section, once we know that the influence of distant parts of the network decays, it provides the potential just learn local policies that already captures what matters instead of trying to learn a fully global one.</p><p data-src=\"plate1.md:30-30\"><strong>Approach:</strong> Use this decay structure to build local representations and learning algorithms whose complexity depends primarily on local interactions rather than the full network size.</p><p data-src=\"plate1.md:32-32\">This idea leads to several related works:</p><ul data-src=\"plate1.md:34-34\"><li><a href=\"https://arxiv.org/abs/2401.16183\" target=\"_blank\"><em>Scalable Reinforcement Learning for Linear-Quadratic Control of Networks</em></a> shows that locality also propagates to individual value and Q-functions, and develops a local actor-critic algorithm for learning distributed controllers.</li></ul><ul data-src=\"plate1.md:36-36\"><li><a href=\"https://arxiv.org/abs/2410.17221\" target=\"_blank\"><em>Scalable Spectral Representations for Multi-Agent Reinforcement Learning in Network MDPs</em></a> further extend our results to the more complex setting with nonlinear dynamics, where it uses exponential decay in network dynamics to construct local spectral representations of Q-functions, leading to scalable learning for continuous-state/action network MDPs with end-to-end guarantees.</li></ul><ul data-src=\"plate1.md:38-38\"><li><a href=\"https://arxiv.org/abs/1912.09135\" target=\"_blank\"><em>Distributed Reinforcement Learning for Decentralized Linear Quadratic Control: A Derivative-Free Policy Optimization Approach</em></a> approaches the same challenge from a complementary direction, learning local controllers through decentralized zeroth-order policy optimization and consensus using only local information.</li></ul>", "remains": "Spatial decay is only one form of useful structure. Real networked systems often contain other kinds of sparsity, communication structure, factorization, temporal structure, or physical structure. Can those also be turned into algorithmic efficiency?", "figs": []}, {"q": "What other structures can be translated into algorithmic efficiency?", "kind": "application", "qSrc": "plate1.md:44-44", "brief": "Graph structure, factorization and multiple timescales each convert into algorithmic efficiency.", "briefSrc": "plate1.md:46-46", "remainsSrc": null, "html": "<p data-src=\"plate1.md:48-48\">Spatial locality is only one example. Across different applications, I have explored how other forms of structure can similarly guide algorithm design.</p><p data-src=\"plate1.md:50-50\"><strong>Graph structure → exploration and coverage.</strong></p><div class=\"pfigpair\"><figure class=\"pfig\" data-fig=\"graph-bandit.gif\" data-src=\"plate1.md:52-52\"><img src=\"figs/key_figs/graph-bandit.gif\" alt=\"\" data-cap=\"\" data-fig=\"graph-bandit.gif\"></figure><figure class=\"pfig\" data-fig=\"coverage-control.gif\" data-src=\"plate1.md:53-53\"><img src=\"figs/key_figs/coverage-control.gif\" alt=\"\" data-cap=\"\" data-fig=\"coverage-control.gif\"></figure></div><p data-src=\"plate1.md:55-55\">In <a href=\"https://arxiv.org/abs/2401.10383\" target=\"_blank\"><em>Cooperative Multi-Agent Graph Bandits</em></a>, we exploit communication and mobility structure to design cooperative exploration algorithms whose performance reflects the underlying graph. In <a href=\"https://arxiv.org/abs/2404.05995\" target=\"_blank\"><em>Multi-Agent Coverage Control with Transient Behavior Consideration</em></a>, we further account for how agents physically move through the environment while learning, rather than optimizing only their eventual coverage configuration.</p><p data-src=\"plate1.md:57-57\"><strong>Factorization + temporal structure → scalable multi-agent path finding.</strong></p><div class=\"pfigpair\"><figure class=\"pfig\" data-fig=\"fico_grouping.png\" data-src=\"plate1.md:59-59\"><img src=\"figs/key_figs/fico_grouping.png\" alt=\"\" data-cap=\"\" data-fig=\"fico_grouping.png\"></figure><figure class=\"pfig\" data-fig=\"fico-result.gif\" data-src=\"plate1.md:60-60\"><img src=\"figs/key_figs/fico-result.gif\" alt=\"\" data-cap=\"\" data-fig=\"fico-result.gif\"></figure></div><p data-src=\"plate1.md:62-62\">My recent MAPF work exploits problem factorization and adaptive planning horizons to coordinate large robot fleets in closed loop: <a href=\"https://arxiv.org/abs/2511.13961\" target=\"_blank\">FICO</a>, <a href=\"https://arxiv.org/abs/2602.12024\" target=\"_blank\">Adaptive-Horizon CBS</a>, and <a href=\"https://arxiv.org/abs/2604.00428\" target=\"_blank\">Certificate-Driven MAPF</a>.</p><p data-src=\"plate1.md:64-65\"><strong>Multiple timescales → building control.</strong><br>In our work on <a href=\"https://www.sciencedirect.com/science/article/pii/S0360132323005462\" target=\"_blank\">natural-ventilation control</a>, we combine learned dynamics at multiple timescales, online adaptation, and MPC for energy-efficient building operation.</p><p data-src=\"plate1.md:67-68\"><strong>Network structure → power-grid topology control (ongoing).</strong><br>I am exploring how grid topology and local interactions can determine what information agents need for scalable multi-agent learning and control.</p><p data-src=\"plate1.md:70-70\">Across these applications, the recurring idea is simple:</p><p data-src=\"plate1.md:72-72\"><strong>identify useful structure in the system, then turn it into algorithmic efficiency.</strong></p>", "remains": null, "figs": []}]}, {"name": "Multi-Agent Learning through a Game-Theoretic Lens", "problemHtml": "<p data-src=\"plate2.md:3-3\"><strong>Problem:</strong> Multiple agents learn and make decisions independently, often with different or even competing objectives, while their policies interact through a shared environment. As a result, individually rational behavior does not necessarily lead to a desirable collective outcome. The challenge is therefore not only whether decentralized learning converges, but <strong>what it converges to, how good the resulting equilibrium is, and how learning can be steered toward better coordinated outcomes.</strong></p>", "steps": [{"q": "What do decentralized MARL algorithms actually converge to?", "kind": null, "qSrc": "plate2.md:5-5", "brief": "We show that first-order stationary policies and Nash equilibria are equivalent.", "briefSrc": "plate2.md:7-7", "remainsSrc": "plate2.md:24-24", "html": "<p data-src=\"plate2.md:9-9\">There is already a rich theory of convergence in MARL, but much of it stops at showing convergence to first-order stationary points. So my starting question was: <strong>what do these stationary points actually represent?</strong></p><p data-src=\"plate2.md:11-11\"><strong>Finding:</strong> In <a href=\"https://arxiv.org/abs/2106.00198\" target=\"_blank\"><em>Gradient Play in Stochastic Games: Stationary Points, Convergence, and Sample Complexity</em></a>, we show that, under direct policy parameterization, first-order stationary policies and Nash equilibria are equivalent.</p><figure class=\"pfig\" data-fig=\"stationary_point_NE_equivalence.png\" data-src=\"plate2.md:13-13\"><img src=\"figs/key_figs/stationary_point_NE_equivalence.png\" alt=\"\" data-cap=\"\" data-fig=\"stationary_point_NE_equivalence.png\"></figure><p data-src=\"plate2.md:16-16\">This was the starting point for me to realize that game-theoretic concepts arise naturally in MARL. Once multiple agents independently optimize decentralized policies while interacting through a shared environment, Nash equilibrium becomes a natural solution concept, even when the underlying problem is cooperative.</p><p data-src=\"plate2.md:18-18\">From there, we studied how this picture changes under different policy parameterizations and game structures. For example:</p><ul data-src=\"plate2.md:20-20\"><li><a href=\"https://arxiv.org/abs/2202.00872\" target=\"_blank\"><em>On the Global Convergence Rates of Decentralized Softmax Gradient Play in Markov Potential Games</em></a> studies the more subtle softmax parameterization, where zero-gradient policies need not be Nash equilibria, and establishes finite-time convergence guarantees for decentralized gradient and natural-gradient play.</li></ul><ul data-src=\"plate2.md:22-22\"><li><a href=\"https://arxiv.org/abs/2206.02640\" target=\"_blank\"><em>Policy Optimization for Markov Games: Unified Framework and Faster Convergence</em></a> develops a broader framework for policy optimization in Markov games, with faster convergence guarantees for zero-sum games and extensions to general-sum games.</li></ul>", "remains": "Convergence to a Nash equilibrium does not by itself imply good system-level performance. There can be many equilibria, and their quality can differ substantially.", "figs": []}, {"q": "How good or bad can an equilibrium be?", "kind": null, "qSrc": "plate2.md:28-28", "brief": "We established price-of-anarchy bound for Markov games, providing a rigorous characterization of the worst-case quality of Nash equilibrium.", "briefSrc": "plate2.md:30-30", "remainsSrc": "plate2.md:41-41", "html": "<p data-src=\"plate2.md:32-32\">Once equilibrium becomes the relevant solution concept, the next natural question is how its performance compares with the globally desirable outcome.</p><figure class=\"pfig\" data-fig=\"poa_figure.png\" data-src=\"plate2.md:35-35\"><img src=\"figs/key_figs/poa_figure.png\" alt=\"\" data-cap=\"\" data-fig=\"poa_figure.png\"></figure><p data-src=\"plate2.md:37-37\"><strong>Finding:</strong> In <a href=\"https://arxiv.org/abs/2304.03840\" target=\"_blank\"><em>Markov Games with Decoupled Dynamics: Price of Anarchy and Sample Complexity</em></a>, we extend the price-of-anarchy perspective to finite-horizon Markov games with decoupled dynamics and coupled rewards, providing a rigorous characterization of the worst-case quality of decentralized equilibria.</p><p data-src=\"plate2.md:39-39\">This turns a convergence result into a performance question: even if decentralized learning converges, what can we actually guarantee about the resulting system-level performance?</p>", "remains": "Price of anarchy tells us how bad an equilibrium can be, but it does not tell us how to avoid undesirable equilibria or systematically reach better ones.", "figs": []}, {"q": "Can we systematically reach better equilibria?", "kind": null, "qSrc": "plate2.md:45-45", "brief": "We develop a framework for equilibrium selection in multi-agent RL.", "briefSrc": "plate2.md:47-47", "remainsSrc": "plate2.md:55-55", "html": "<p data-src=\"plate2.md:49-49\">This led to my work on <strong>equilibrium selection</strong>.</p><p data-src=\"plate2.md:51-51\"><strong>Approach:</strong> In <a href=\"https://arxiv.org/abs/2406.08844\" target=\"_blank\"><em>Equilibrium Selection for Multi-agent Reinforcement Learning: A Unified Framework</em></a>, we borrow ideas from equilibrium selection in static normal-form games, especially stochastic stability, and develop a framework for transferring these equilibrium-selection mechanisms to stochastic games.</p><p data-src=\"plate2.md:53-53\">The goal is to move beyond simply proving convergence and instead understand how learning dynamics can favor equilibria with desirable properties.</p>", "remains": "The framework gives a principled theoretical mechanism for equilibrium selection, but the resulting selection dynamics can be slow in practice. We would like more direct and efficient ways to discover desirable coordinated behaviors rather than relying on slow asymptotic selection.", "figs": []}, {"q": "Can we discover and select good coordinated behaviors more efficiently?", "kind": null, "qSrc": "plate2.md:59-59", "brief": "Leveraging optimism and diversity", "briefSrc": "plate2.md:61-61", "remainsSrc": null, "html": "<p data-src=\"plate2.md:63-63\">This motivates my more recent work on algorithmic mechanisms that shape the behaviors discovered during learning.</p><ul data-src=\"plate2.md:65-65\"><li><strong>Optimism / risk-seeking:</strong> In <a href=\"https://arxiv.org/abs/2509.24047\" target=\"_blank\"><em>Optimism as Risk-Seeking in Multi-Agent Reinforcement Learning</em></a>, we interpret optimism through risk-seeking objectives and develop decentralized optimistic actor-critic algorithms. The idea is that optimism can encourage agents to explore coordinated outcomes that risk-neutral learning may fail to reach.</li></ul><ul data-src=\"plate2.md:67-67\"><li><strong>Diversity (ongoing):</strong> Can we deliberately discover and maintain qualitatively different coordinated behaviors / equilibria instead of collapsing to one solution?</li></ul><p data-src=\"plate2.md:71-71\">So the question has gradually evolved from <strong>“Does MARL converge?”</strong> to <strong>“Can MARL efficiently discover and select high-quality coordinated behaviors?”</strong></p>", "remains": null, "figs": []}, {"q": "Transportation Operations and System Design", "kind": "application", "qSrc": "plate2.md:73-73", "brief": "", "briefSrc": null, "remainsSrc": null, "html": "<p data-src=\"plate2.md:75-75\">Transportation systems provide a natural setting for these questions because different regions, operators, and mobility services make their own decisions while sharing infrastructure, users, and congestion.</p><p data-src=\"plate2.md:77-77\">In <a href=\"https://arxiv.org/abs/2508.12059\" target=\"_blank\"><em>Co-Investment with Payoff-Sharing Mechanism for Cooperative Decision-Making in Network Design Games</em></a>, we study strategic interactions among interconnected network operators. The framework combines a non-cooperative network-design game with cooperative mechanisms for <strong>co-investment and payoff sharing</strong>, asking when independently operated subnetworks can find mutually beneficial opportunities to cooperate while preserving their individual incentives.</p><figure class=\"pfig\" data-fig=\"coinv_framework.png\" data-src=\"plate2.md:79-79\"><img src=\"figs/key_figs/coinv_framework.png\" alt=\"\" data-cap=\"\" data-fig=\"coinv_framework.png\"></figure><p data-src=\"plate2.md:82-82\">A related but different question is how to induce a desired system-level outcome when operators remain strategic. In <a href=\"https://arxiv.org/abs/2605.18687\" target=\"_blank\"><em>Implementation-Based Incentive Design for Autonomous Mobility-on-Demand and Transit Systems</em></a>, we take an implementation perspective: rather than searching for a policy and then predicting which equilibrium it induces, we start from a desirable target operating profile and ask <strong>what incentive is needed to make unilateral deviations unattractive</strong>. This leads to an implementation-based framework for coordinating strategic AMoD and public-transit operators under endogenous passenger choices.</p><figure class=\"pfig\" data-fig=\"amod_framework.png\" data-src=\"plate2.md:84-84\"><img src=\"figs/key_figs/amod_framework.png\" alt=\"\" data-cap=\"\" data-fig=\"amod_framework.png\"></figure>", "remains": null, "figs": []}]}, {"name": "Robust and Feasible Decision-Making under Uncertainty", "problemHtml": "<p data-src=\"plate3.md:3-3\"><strong>Problem:</strong> Real systems must make decisions with imperfect models and incomplete knowledge of the environment, while also satisfying physical, operational, and safety constraints. Model errors can make an otherwise good decision unreliable, and some requirements cannot simply be traded against performance. The challenge is therefore twofold: <strong>how do we remain robust when our model is wrong, and how do we preserve feasibility when constraints must be satisfied?</strong></p>", "steps": [{"q": "How should we make decisions when the model is imperfect?", "kind": null, "qSrc": "plate3.md:5-5", "brief": "We develop efficient and robust offline reinforcement-learning algorithms for decision-making under model uncertainty.", "briefSrc": "plate3.md:7-7", "remainsSrc": "plate3.md:13-13", "html": "<p data-src=\"plate3.md:9-9\">My starting point was <strong>robust decision-making</strong>: if we do not fully trust one nominal model of the environment, how should that uncertainty change the way we optimize a policy?</p><p data-src=\"plate3.md:11-11\"><strong>Finding:</strong> In <a href=\"https://arxiv.org/abs/2306.11626\" target=\"_blank\"><em>Soft Robust MDPs and Risk-Sensitive MDPs: Equivalence, Policy Gradient, and Sample Complexity</em></a>, we establish an equivalence between a class of soft robust MDPs and risk-sensitive MDPs. This connection allows us to solve robust RL through risk-sensitive formulations, leading to <strong>more efficient algorithms and sample-complexity guarantees under weaker assumptions than prior robust RL approaches</strong>. In particular, the resulting methods avoid repeatedly solving costly inner robust-optimization problems while retaining a principled treatment of model uncertainty.</p>", "remains": "Robustness protects performance against model uncertainty. But many physical systems also impose requirements that cannot simply be traded against performance: dynamics must hold, safety limits must be respected, and trajectories must remain feasible.", "figs": []}, {"q": "How do we optimize performance while preserving feasibility?", "kind": null, "qSrc": "plate3.md:17-17", "brief": "We develop control-inspired constrained optimization methods that actively regulate feasibility while optimizing performance.", "briefSrc": "plate3.md:19-19", "remainsSrc": "plate3.md:40-40", "html": "<p data-src=\"plate3.md:21-21\">The answer depends on <strong>what access we have to the feasible set</strong>.</p><figure class=\"pfig\" data-fig=\"FOFL.png\" data-src=\"plate3.md:23-23\"><img src=\"figs/key_figs/FOFL.png\" alt=\"\" data-cap=\"\" data-fig=\"FOFL.png\"></figure><p data-src=\"plate3.md:25-26\"><strong>Differentiable constraints → control-theoretic constrained optimization.</strong><br>When constraints are explicitly known and differentiable, we can view constrained optimization as a control problem: design the optimization dynamics so that constraint violation is regulated to zero while the objective decreases. In <a href=\"https://arxiv.org/abs/2503.12665\" target=\"_blank\"><em>Constrained Optimization From a Control Perspective via Feedback Linearization</em></a>, we use feedback linearization to construct such updates with a prescribed feasibility decay rate, yielding convergence guarantees to KKT points and a principled alternative to penalty-based constraint handling.</p><p data-src=\"plate3.md:29-29\">Our work also extends to machine learning. In <a href=\"https://arxiv.org/abs/2605.08408\" target=\"_blank\"><em>AdamFLIP</em></a>, we apply these ideas to hard-constrained physics-informed neural network training, achieving better optimization performance while enforcing constraints directly rather than through penalty terms.</p><figure class=\"pfig\" data-fig=\"ZOFL.png\" data-src=\"plate3.md:31-31\"><img src=\"figs/key_figs/ZOFL.png\" alt=\"\" data-cap=\"\" data-fig=\"ZOFL.png\"></figure><p data-src=\"plate3.md:35-36\"><strong>Black-box constraints → zeroth-order constrained optimization.</strong><br>Sometimes we can evaluate a constraint but cannot differentiate it. Hence, the required derivatives must be estimated from function queries. These zeroth-order estimates can be inaccurate, making feasibility especially challenging: errors in the estimated constraint gradients directly affect the correction used to enforce the constraints.</p><p data-src=\"plate3.md:38-38\">In <a href=\"https://arxiv.org/abs/2509.24056\" target=\"_blank\"><em>Zeroth-Order Constrained Optimization via Feedback Linearization</em></a>, we extend the control-theoretic formulation to this setting and study how feasibility can still be regulated despite gradient-estimation error. Our later work, <a href=\"https://arxiv.org/abs/2604.02202\" target=\"_blank\"><em>Random-Subspace SQP</em></a>, provides a complementary optimization perspective on this idea: the zeroth-order update can be understood through optimization over randomly sampled low-dimensional subspaces. This interpretation leads to a more general algorithmic framework and stronger convergence guarantees, while retaining the computational advantage of avoiding full-dimensional derivative estimation.</p>", "remains": "Both settings still assume that feasibility is explicitly defined. But in increasingly data-driven systems, we may only have examples of feasible behavior, with no constraint equation available at all.", "figs": []}, {"q": "How do we optimize when feasibility is represented only through data?", "kind": null, "qSrc": "plate3.md:44-44", "brief": "Diffusion models can encode feasible behavior directly from data, allowing optimization over an implicitly learned feasible set.", "briefSrc": "plate3.md:46-46", "remainsSrc": null, "html": "<p data-src=\"plate3.md:48-48\">This is the setting I am studying in <strong>diffusion-based planning</strong>.</p><p data-src=\"plate3.md:50-50\">A diffusion model trained on feasible trajectories can represent complex feasible behavior directly from data, even when no explicit description of the feasible trajectory set is available. This makes diffusion a natural model of feasibility for planning and decision-making.</p><figure class=\"pfig\" data-fig=\"gradient-guidance.png\" data-src=\"plate3.md:52-52\"><img src=\"figs/key_figs/gradient-guidance.png\" alt=\"\" data-cap=\"\" data-fig=\"gradient-guidance.png\"></figure><p data-src=\"plate3.md:54-54\">The challenge is that standard gradient guidance optimizes the task objective in the ambient trajectory space. As a result, the gradient can point away from the learned feasible set, so improving the objective may simultaneously destroy dynamic feasibility.</p><p data-src=\"plate3.md:57-57\"><strong>Approach:</strong> Our work on <a href=\"https://arxiv.org/abs/2608.29507\" target=\"_blank\">Denoising-Corrected Gradient Guidance (DCG)</a> views diffusion planning as constrained optimization over an implicitly learned feasible set. The key insight is that the denoiser behaves like an approximate projection onto the data support: the gradient step improves the objective, while denoising corrects the trajectory back toward feasible behavior. This leads to a simple guided-diffusion algorithm with finite-time convergence guarantees under linear, convex, and smooth-manifold geometries.</p><div class=\"pfigpair\"><figure class=\"pfig\" data-fig=\"DCG-result.jpg\" data-src=\"plate3.md:59-59\"><img src=\"figs/key_figs/DCG-result.jpg\" alt=\"\" data-cap=\"\" data-fig=\"DCG-result.jpg\"></figure><figure class=\"pfig\" data-fig=\"DCG-result-2.jpg\" data-src=\"plate3.md:60-60\"><img src=\"figs/key_figs/DCG-result-2.jpg\" alt=\"\" data-cap=\"\" data-fig=\"DCG-result-2.jpg\"></figure></div><figure class=\"pfig\" data-fig=\"DCG-result-legend.jpg\" data-src=\"plate3.md:62-62\"><img src=\"figs/key_figs/DCG-result-legend.jpg\" alt=\"\" data-cap=\"\" data-fig=\"DCG-result-legend.jpg\"></figure>", "remains": null, "figs": []}]}];
  SRCS.forEach(SRC => {
    const th = THEMES.find(x => x.property === SRC.name);
    if (!th) { console.warn('no theme matches', SRC.name); return; }
    th.problemHtml = SRC.problemHtml;
    SRC.steps.forEach((s, i) => {
      const step = th.steps[i] || (th.steps[i] = {});
      step.q = s.q;
      step.qSrc = s.qSrc;
      step.briefSrc = s.briefSrc;
      step.gapSrc = s.remainsSrc;
      step.kind = s.kind || undefined;
      step.findingBrief = s.brief;
      step.bodyHtml = s.html;
      step.gap = s.remains || null;
      step.remains = null;            // shown once, in the connector between cards
      step.figs = s.figs || [];
      step.tension = step.tension || [];
      step.finding = step.finding || [];
      step.pubs = step.pubs || [];
    });
    // v4 attached publications by step index. The markdown reordered and rewrote
    // the cards, so a card can inherit a paper it never actually discusses. Drop
    // any paper this theme already links in its own prose from the card's own
    // list; the reference list still sees it, so nothing disappears from there.
    const linked = new Set();
    const grab = h => (String(h || '').match(/href="([^"]+)"/g) || [])
      .forEach(m => linked.add(m.slice(6, -1)));
    grab(th.problemHtml);
    th.steps.forEach(s => { grab(s.bodyHtml); grab(s.gap); });
    // pubs still feeds the reference list; pubsShow is what a card prints
    th.steps.forEach(s => { s.pubsShow = (s.pubs || []).filter(p => !linked.has(p.u)); });
    // steps the markdown no longer covers are dropped, but their publications
    // are kept so the reference list stays complete
    if (th.steps.length > SRC.steps.length) {
      const dropped = th.steps.splice(SRC.steps.length);
      const last = th.steps[th.steps.length - 1];
      dropped.forEach(d => (d.pubs || []).forEach(p => last.pubs.push(p)));
    }
  });
})();

/* Plate V rewritten in plate5.md. */
Object.assign(FUTURE, {"fig": "figs/key_figs/composability.png", "figCap": "", "figCapSrc": null, "headline": "Coordination architectures for composable multi-agent systems", "headlineSrc": "plate5.md:3-3", "lead": "As autonomous agents become more capable, the next bottleneck may not be training one stronger agent, but assembling many independently trained agents into a capable team.", "leadSrc": "plate5.md:9-9", "paras": [{"t": "Today, many multi-agent systems still rely on strong assumptions: agents are trained together, share the same conventions, or adapt to each other only after observing enough behavior. But future systems will likely be much messier. Robots, AI agents, infrastructure controllers, and decision-making modules may be trained by different groups, on different data, with different objectives, interfaces, and hidden conventions. They may need to work together without joint retraining.", "s": "plate5.md:15-15"}, {"t": "There are already rich lines of work on related problems, including zero-shot coordination, ad hoc teamwork, theory of mind, multi-agent communication, and teammate modeling. These works answer important pieces of the puzzle. But I am interested in a broader architectural question: <strong>what should the coordination architecture look like when independently trained agents need to become a team?</strong>", "s": "plate5.md:17-17"}, {"t": "A useful analogy is modular software. A module is not useful only because its internal code is good. It is useful because it has an interface: other modules know what it expects, what it provides, and how to interact with it. Multi-agent systems need something similar, but richer. An agent's interface should also help others understand what it can do, how it tends to behave, what information it needs, and how it can be adjusted. That is why I think coordination should be treated as an <strong>architectural layer</strong>, not merely as an emergent property of self-play or behavior-only adaptation.", "s": "plate5.md:19-19"}], "bets": [], "components": [{"name": "Incoming interface", "nameSrc": "plate5.md:31-31", "summary": "How an agent understands and reacts to what it receives.", "summarySrc": "plate5.md:33-33", "paras": [{"t": "Once useful information is exposed, another agent must be able to use it. It should not simply store context as text or metadata. It should convert that information into decisions: what role to take, what behavior to expect, what operating mode to use, when to communicate, and when to revise its belief.", "s": "plate5.md:35-35"}, {"t": "For example, if another agent tends to take a certain role, has limited sensing, rarely yields at bottlenecks, or was trained on a different task distribution, the receiving agent should know how this changes its own behavior.", "s": "plate5.md:37-37"}, {"t": "This connects naturally to teammate modeling, theory of mind, and ad hoc teamwork, but the goal is broader. The incoming interface should become a reusable mechanism for understanding and reacting to new partners, not just a task-specific adaptation trick.", "s": "plate5.md:39-39"}], "questions": [{"t": "How should an agent convert incoming context into beliefs, roles, plans, or operating modes?", "s": "plate5.md:41-41"}, {"t": "How should agents use those beliefs, roles, plans or operating modes to make decisions?", "s": "plate5.md:42-42"}, {"t": "How should an agent refine its interpretation as it observes more behavior?", "s": "plate5.md:43-43"}]}, {"name": "Train for composability", "nameSrc": "plate5.md:45-45", "summary": "How to train agents to coordinate, communicate, and adapt.", "summarySrc": "plate5.md:47-47", "paras": [{"t": "The outgoing and incoming interfaces should not be treated as afterthoughts added after training. If agents will later be assembled into new teams, they should be trained not only to perform well, but also to be understandable, adaptable, and useful to others. This means agents should learn how to expose useful information, interpret incoming information, and adjust their behavior when coordination changes.", "s": "plate5.md:49-49"}, {"t": "This is the part that makes the vision more than a protocol design problem. A useful coordination architecture cannot only be written down after training. It should influence the training process itself.", "s": "plate5.md:51-51"}], "questions": [{"t": "How do we train agents whose behavior is legible to new partners?", "s": "plate5.md:53-53"}, {"t": "How do we train agents to communicate the right information at the right level of abstraction?", "s": "plate5.md:54-54"}, {"t": "How do we train agents to deliberately use incoming context rather than ignore it?", "s": "plate5.md:55-55"}, {"t": "How do we train adaptable operating modes, so that an agent can be steered without full retraining?", "s": "plate5.md:56-56"}, {"t": "How do we evaluate whether an agent is composable, not just high-performing?", "s": "plate5.md:57-57"}]}, {"name": "Outgoing interface", "nameSrc": "plate5.md:59-59", "summary": "What useful information an agent should report about itself.", "summarySrc": "plate5.md:61-61", "paras": [{"t": "An agent may need to report information about its training background, behavioral tendencies, capabilities, uncertainty, current intent, or available operating modes. This information could be encoded in structured fields, natural language, learned embeddings, diagnostic statistics, or a hybrid format. The key is that it should be useful for coordination.", "s": "plate5.md:63-63"}, {"t": "This is related to multi-agent communication, model cards, agent interoperability, and language-grounded coordination. But here the goal is not only communication for one task. The goal is to understand what kind of outgoing interface makes agents easier to compose with others.", "s": "plate5.md:65-65"}], "questions": [{"t": "What should an agent communicate before interaction begins, and what kinds of teammate information are useful for decision-making?", "s": "plate5.md:67-67"}, {"t": "What should it communicate during interaction?", "s": "plate5.md:68-68"}, {"t": "How can it summarize its training history, behavior, capabilities, and limitations in a compact way?", "s": "plate5.md:69-69"}]}], "groundLead": "", "groundLeadSrc": null, "apps": [], "closing": "The long-term goal is a principled architecture for open multi-agent coordination: a way for agents to expose useful information, understand incoming context, adapt through interaction, and be trained for composability from the beginning. Not a rigid hand-coded rulebook, but a structure through which agents make themselves understandable to others, receive and use coordination-relevant information, and adapt as the team and task evolve. This is the kind of multi-agent intelligence I want to build next: agents that do not only perform well alone, but can be <strong>assembled, connected, adapted, and deployed</strong> as robust teams.", "closingSrc": "plate5.md:75-75"});
