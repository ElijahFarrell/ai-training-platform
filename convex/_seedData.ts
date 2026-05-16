export type SeedModule = {
  slug: string;
  title: string;
  summary: string;
  agencyTag: string;
  audience: string;
  estimatedMinutes: number;
  order: number;
  lessons: Array<{
    title: string;
    type: "video" | "reading" | "document";
    body: string;
    videoUrl?: string;
    documentTitle?: string;
    documentUrl?: string;
  }>;
  quiz: {
    title: string;
    passingScore: number;
    questions: Array<{
      prompt: string;
      options: Array<{ id: string; label: string }>;
      correctOptionId: string;
      explanation: string;
    }>;
  };
};

export const SEED_MODULES: SeedModule[] = [
  {
    slug: "ai-fundamentals-for-public-service",
    title: "AI fundamentals for public service",
    summary:
      "A non-technical introduction to generative AI for federal employees: capabilities, limits, and where it does and does not belong in government work.",
    agencyTag: "Cross-agency",
    audience: "All employees",
    estimatedMinutes: 35,
    order: 1,
    lessons: [
      {
        title: "What generative AI actually does",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/2IK3DFHRFfw",
        body: "Modern generative AI systems are pattern completion engines trained on very large text corpora. They predict the most likely next token given the input and the context the model has already produced.\n\nWhy this matters for government work:\n- The model is not a database of facts. It is a statistical model of language. It can sound confident while being wrong.\n- It does not access the open internet during a response unless you give it a tool that does.\n- It cannot reliably cite sources unless retrieval is wired in.\n\nOperating principle for the federal workforce: treat model output as a draft to be verified, never as authoritative record.",
      },
      {
        title: "Where AI fits in government workflows",
        type: "reading",
        body: "AI is well-suited to:\n- Summarizing long, public documents into briefing notes.\n- Drafting first-pass language for standard correspondence.\n- Translating technical material into plain English for public communications.\n- Searching across an internal corpus when wired into an enterprise search system.\n\nAI is poorly suited to (or outright unsafe for):\n- Making consequential determinations about individual citizens without human-in-the-loop review.\n- Handling Controlled Unclassified Information (CUI) on a system not approved for that data class.\n- Generating quantitative analyses where exact arithmetic matters.\n- Producing legally binding text without review by counsel.\n\nInternal policy: any AI-assisted output that leaves the agency in an official capacity must be reviewed by a human authorized to issue that content.",
      },
      {
        title: "Acceptable use policy",
        type: "document",
        documentTitle: "OMB M-24-10 Memorandum on AI in Federal Agencies (excerpt)",
        documentUrl:
          "https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf",
        body: "For this demo, treat the linked memorandum as the canonical authority on acceptable agency use of AI.\n\nThree obligations to remember:\n1. Inventory: every AI use case in your unit must be reportable to your Chief AI Officer.\n2. Impact: rights-impacting and safety-impacting uses require additional review.\n3. Human review: outputs that affect benefits, rights, safety, or public health must have a human in the loop with the authority and information needed to override the model.\n\nWhen in doubt, escalate to your agency's AI governance contact before deploying.",
      },
    ],
    quiz: {
      title: "AI fundamentals knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt: "Which statement most accurately describes a generative AI model?",
          options: [
            { id: "a", label: "A real-time database of verified facts" },
            { id: "b", label: "A pattern-completion engine trained on text corpora" },
            { id: "c", label: "A reasoning system that always cites its sources" },
            { id: "d", label: "A search engine for the open internet" },
          ],
          correctOptionId: "b",
          explanation:
            "Generative models predict the most likely next token given context. They are not databases and do not browse the live internet without explicit tools.",
        },
        {
          prompt:
            "An employee wants to use an AI assistant to make a final determination about a citizen's benefit eligibility. Per OMB M-24-10, this is:",
          options: [
            { id: "a", label: "Encouraged, as it speeds up service delivery" },
            { id: "b", label: "Acceptable as long as the model is open source" },
            {
              id: "c",
              label:
                "A rights-impacting use that requires human-in-the-loop review with override authority",
            },
            { id: "d", label: "Forbidden under all circumstances" },
          ],
          correctOptionId: "c",
          explanation:
            "OMB M-24-10 specifically requires human review with override authority for rights-impacting and safety-impacting uses.",
        },
        {
          prompt: "Which of these is the safest first use of generative AI for a public-affairs office?",
          options: [
            { id: "a", label: "Drafting plain-English versions of already-public agency documents" },
            { id: "b", label: "Producing legal opinions for senior leadership" },
            { id: "c", label: "Handling CUI on an unapproved system" },
            { id: "d", label: "Generating financial projections" },
          ],
          correctOptionId: "a",
          explanation:
            "Plain-language translation of public content is a low-risk, high-value first use. The other three are explicitly out of scope without specific authorization.",
        },
      ],
    },
  },
  {
    slug: "responsible-prompting-for-staff",
    title: "Responsible prompting for staff",
    summary:
      "A working guide to structured prompting, source grounding, and the verification habits every federal employee should bring to AI tools.",
    agencyTag: "Cross-agency",
    audience: "Knowledge workers",
    estimatedMinutes: 25,
    order: 2,
    lessons: [
      {
        title: "The four-part prompt",
        type: "reading",
        body: "A reliable prompt for federal work has four parts:\n\n1. Role: the perspective the model should take. (\"You are a constituent-services analyst.\")\n2. Task: the specific outcome you want. (\"Summarize the attached complaint into three bullet points and one suggested response.\")\n3. Constraints: tone, length, audience, prohibited content. (\"Plain English at an 8th-grade reading level. Do not invent statistics. If the source is unclear, say so.\")\n4. Source: the material the model should reason about, pasted in or referenced via retrieval.\n\nWithout source grounding the model will reach for plausible-sounding patterns from its training data. With source grounding you can audit every claim back to a real document.",
      },
      {
        title: "Recognizing a hallucination",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/cwOH2-WSlbY",
        body: "A hallucination is a confidently stated claim that has no basis in the source material or in verifiable reality.\n\nCommon patterns to look for:\n- Specific-sounding numbers, dates, names, or citations you did not provide.\n- \"Studies show…\" or \"The law states…\" without a verifiable reference.\n- Confident answers to questions the model could not possibly know (closed-network specifics, very recent events).\n\nVerification habit: for any factual claim that will leave your desk, click the source. If the model cannot show you the source, treat the claim as unverified.",
      },
      {
        title: "Verification checklist",
        type: "reading",
        body: "Before any AI-assisted output leaves your desk:\n\n- Does every factual claim have a source you can open and read?\n- Did you compare numbers in the output against the numbers in the source?\n- Did you remove anything that the model invented (names, citations, statutes)?\n- Is the tone appropriate for the audience and the agency's communications standards?\n- Did you record what tool you used, the prompt, and the date, in case the output is later questioned?\n\nIf you cannot answer yes to all five, the output is a draft, not a deliverable.",
      },
    ],
    quiz: {
      title: "Responsible prompting check",
      passingScore: 70,
      questions: [
        {
          prompt: "Which prompt is most likely to produce a verifiable output?",
          options: [
            { id: "a", label: "Tell me everything about housing policy." },
            {
              id: "b",
              label:
                "You are a housing-policy analyst. Summarize the attached HUD report into three bullet points for a non-expert audience. Cite the page number for each claim.",
            },
            { id: "c", label: "Write a memo about housing." },
            { id: "d", label: "Be helpful." },
          ],
          correctOptionId: "b",
          explanation:
            "The four-part prompt — role, task, constraints, source — produces an output you can audit. The other three either invite hallucination or are too vague to be useful.",
        },
        {
          prompt:
            "An AI assistant gives you a specific dollar figure for next year's projected agency budget. You should:",
          options: [
            { id: "a", label: "Use it directly in the briefing." },
            {
              id: "b",
              label: "Treat it as unverified until you locate the figure in an authoritative source.",
            },
            { id: "c", label: "Ask the model to make the figure more specific." },
            { id: "d", label: "Round it down to be safe." },
          ],
          correctOptionId: "b",
          explanation:
            "Specific-sounding numbers from a model are a classic hallucination pattern. Always verify against the authoritative source.",
        },
      ],
    },
  },
  {
    slug: "federal-ai-competency-framework",
    title: "The federal AI competency framework",
    summary:
      "How federal staff are expected to build AI proficiency under the U.S. Department of Labor AI Literacy Framework: the three competency tracks, who each track is for, and how progress is recorded in the IDP.",
    agencyTag: "Cross-agency",
    audience: "All employees",
    estimatedMinutes: 30,
    order: 3,
    lessons: [
      {
        title: "Why a competency framework exists",
        type: "reading",
        body: "Most AI failures inside government are not technology failures. They are competency failures: a tool was deployed faster than the workforce understood what it could and could not do.\n\nThe U.S. Department of Labor AI Literacy Framework (February 2026) was published to fix that gap. It defines a shared baseline for what every federal employee should know about AI, what people who interpret AI outputs should know, and what people who govern AI systems should know. It is workflow-aligned, not classroom-aligned: competency is built in 15-30 minute increments inside the daily job, not in week-long offsites that pull staff out of operations.\n\nFor an EEO office or any merit-based program, the framework matters for one specific reason: it gives leadership a defensible answer to the question \"how do you know your staff can responsibly operate this tool?\" The answer is the framework, the track, and the recorded competency milestone.",
      },
      {
        title: "The three tracks: Foundational, Intermediate, Advanced",
        type: "reading",
        body: "The framework groups competency into three tracks, each with a clear audience.\n\nFoundational is for everyone. It covers what AI and machine learning actually are in a federal context, what an automated tool such as the MD-715 dashboard does and does not do, basic data literacy for reading model outputs in context, the principle of responsible AI use (model limits, when human judgment takes precedence), and the applicable federal AI policy environment: the Secretary of War AI mandate, OMB M-24-10, and the NIST AI Risk Management Framework.\n\nIntermediate is for staff who interpret and act on AI outputs. It covers reading longitudinal trend data and process-gap findings at the organizational-unit level, correlating operational survey data (for example DEOCS) with quantitative workforce metrics, hands-on dashboard exercises against live agency data, and human-in-the-loop decision making, where AI recommends and authorized personnel decide.\n\nAdvanced is for program owners, EEO directors, and senior analysts. It covers model performance monitoring and how to spot unreliable outputs, strategic communication of operational insights to senior leadership, and the AI governance responsibilities that sit with a program owner, including accountability for outcomes the model influences.",
      },
      {
        title: "Recording competency in your IDP",
        type: "reading",
        body: "Completing a track is not the goal. Demonstrated competency is the goal.\n\nFor each module you complete, three things should be tracked:\n\n1. Competency demonstration: did you independently perform the operational task the module covered?\n2. Adoption: are you actually using the tool in your daily workflow after the training, and how often?\n3. Operational indicators: how confident do you feel, how often do you escalate to support, how long did adoption take?\n\nMilestone completion is recorded in your Individual Development Plan (IDP). The same record supports two outside certification pathways if you choose to pursue them: Microsoft AI-900 (Azure AI Fundamentals) and CompTIA AI Essentials. Neither is required, but both align cleanly with the Foundational and Intermediate tracks and signal external validation of the same competencies.",
      },
    ],
    quiz: {
      title: "Competency framework check",
      passingScore: 70,
      questions: [
        {
          prompt:
            "An EEO director who needs to interpret dashboard outputs and decide when to escalate findings should be working in which track?",
          options: [
            { id: "a", label: "Foundational only." },
            { id: "b", label: "Intermediate, after completing Foundational." },
            { id: "c", label: "Advanced only." },
            { id: "d", label: "No track is required for directors." },
          ],
          correctOptionId: "b",
          explanation:
            "Interpreting outputs and acting on them is the Intermediate track's purpose. Foundational is the prerequisite. Advanced is for program-owner governance responsibilities on top of that.",
        },
        {
          prompt:
            "Which of the following is the right way to evidence that a staff member is competent to operate an AI tool?",
          options: [
            { id: "a", label: "They watched the training video." },
            { id: "b", label: "They passed the end-of-module quiz." },
            {
              id: "c",
              label:
                "Their IDP records a competency demonstration, sustained adoption, and operational indicators.",
            },
            { id: "d", label: "They hold a Microsoft AI-900 certification." },
          ],
          correctOptionId: "c",
          explanation:
            "The framework explicitly tracks three dimensions — competency demonstration, adoption, and operational indicators — recorded in the IDP. Watching a video, passing a quiz, or holding an outside cert each contribute, but none alone is the standard.",
        },
        {
          prompt:
            "Why does the framework deliver training in 15-30 minute micro-learning modules instead of multi-day classroom blocks?",
          options: [
            { id: "a", label: "Micro-learning is cheaper to produce." },
            {
              id: "b",
              label:
                "Operational offices cannot pull staff out of the workflow for long blocks, and competency is built more reliably when training is integrated with daily work.",
            },
            { id: "c", label: "Federal contracting prohibits multi-day training." },
            { id: "d", label: "Adult learners cannot focus for longer than 30 minutes." },
          ],
          correctOptionId: "b",
          explanation:
            "The framework is explicit on this: training has to fit inside an operating tempo with reduced staffing, and competency sticks better when it is practiced in the actual workflow rather than rehearsed in a classroom.",
        },
      ],
    },
  },
  {
    slug: "nist-ai-risk-management-framework",
    title: "NIST AI Risk Management Framework in practice",
    summary:
      "A practical walkthrough of the NIST AI RMF (AI 100-1) for federal program owners: the four core functions, what they require, and how to apply them to a real EEO use case.",
    agencyTag: "Cross-agency",
    audience: "Program owners and analysts",
    estimatedMinutes: 35,
    order: 4,
    lessons: [
      {
        title: "Why NIST AI RMF is the federal reference",
        type: "reading",
        body: "When OMB Memorandum M-24-10 directed agencies to manage risk from AI use, it did not invent a new framework. It pointed at one that already existed: the NIST AI Risk Management Framework, AI 100-1, published in January 2023.\n\nNIST AI RMF is voluntary, technology-agnostic, and use-case-agnostic. Its job is to give any organization — federal or not — a common vocabulary for asking \"is this AI system fit for purpose, and how would we know?\" Inside the federal government it has effectively become the default reference: OMB cites it, agency AI use-case inventories cite it, and the Department of Labor AI Literacy Framework requires Foundational-track learners to be aware of it.\n\nFor a program owner, you do not need to memorize the whole document. You need to be able to answer four questions about your AI system, one for each of the framework's core functions: Govern, Map, Measure, and Manage.",
      },
      {
        title: "The four core functions",
        type: "reading",
        body: "Govern. Who is accountable for outcomes from this system? What policies does its use sit under? Who can stop it? Governance is a continuous activity, not a launch checklist.\n\nMap. What is the system actually doing, in whose context, with what inputs and what intended outcomes? Mapping forces you to write down assumptions: who the users are, who is affected, what \"success\" means, and what failure modes are foreseeable.\n\nMeasure. How are you quantifying performance, fairness, robustness, and explainability — before launch and on a recurring cadence after? Measurement requires actual numbers tied to defined thresholds, not adjectives.\n\nManage. When the measurements show drift, degradation, or unanticipated impact, what is the response? Who decides whether to retrain, restrict, or retire the system? Management is the connective tissue between Measure and Govern.\n\nThe four functions are not phases. They run in parallel for as long as the system is in operation.",
      },
      {
        title: "Applying RMF to an EEO automation tool",
        type: "reading",
        body: "Take the MD-715 automation tool as the worked example.\n\nGovern: the EEO director is the named accountable owner. The tool operates under the office's existing AI use policy and inside the FedRAMP-authorized Microsoft tenant. There is a documented kill switch — the director can revert to manual review at any point.\n\nMap: the tool ingests workforce data and produces process-gap findings at the organizational-unit level. Users are EEO analysts and directors. Affected populations are every employee whose unit is included. Foreseeable failure modes include unit-level data sparsity, miscategorized fields, and stale historical baselines.\n\nMeasure: model outputs are validated against a held-out manual review on a quarterly cadence. Accuracy targets are set per output type. DEOCS survey data is used as a triangulating signal — when quantitative findings and survey findings diverge, it is investigated, not ignored.\n\nManage: when measured accuracy drops below threshold, retraining is scheduled inside the continuous-learning framework. When a finding has unanticipated downstream effects, the director can pause publication while the issue is reviewed.\n\nThat is the framework working as intended: not a binder, a discipline.",
        documentTitle: "NIST AI Risk Management Framework (AI 100-1)",
        documentUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
      },
    ],
    quiz: {
      title: "NIST AI RMF check",
      passingScore: 70,
      questions: [
        {
          prompt: "What is the relationship between OMB M-24-10 and NIST AI RMF?",
          options: [
            { id: "a", label: "They are competing frameworks; agencies pick one." },
            { id: "b", label: "M-24-10 directs agencies to manage AI risk and points at NIST AI RMF as the reference." },
            { id: "c", label: "NIST AI RMF replaced M-24-10." },
            { id: "d", label: "Neither applies to internal-use AI tools." },
          ],
          correctOptionId: "b",
          explanation:
            "M-24-10 sets the policy direction; NIST AI RMF supplies the practical vocabulary and structure. Federal agencies use them together.",
        },
        {
          prompt: "Which NIST AI RMF function is responsible for naming the accountable owner of an AI system?",
          options: [
            { id: "a", label: "Map" },
            { id: "b", label: "Measure" },
            { id: "c", label: "Govern" },
            { id: "d", label: "Manage" },
          ],
          correctOptionId: "c",
          explanation:
            "Govern covers accountability, policy, and authority — including who can stop the system. Map describes context, Measure quantifies performance, Manage responds to what Measure finds.",
        },
        {
          prompt:
            "An EEO analytics tool's measured accuracy on quarterly validation drops below the defined threshold. Under NIST AI RMF, the immediate response sits primarily under which function?",
          options: [
            { id: "a", label: "Map — the use case has changed." },
            { id: "b", label: "Manage — a measured deviation requires a defined response." },
            { id: "c", label: "Govern — the policy needs to be rewritten." },
            { id: "d", label: "No action is required until the next annual review." },
          ],
          correctOptionId: "b",
          explanation:
            "Manage is the function that handles measured deviations: deciding whether to retrain, restrict, or retire. Govern is invoked if accountability or policy needs to change as a result.",
        },
      ],
    },
  },
  {
    slug: "ai-governance-for-program-owners",
    title: "AI governance for program owners",
    summary:
      "An advanced-track module for EEO directors and program owners: model performance monitoring, recognizing unreliable outputs, communicating insights to senior leadership, and the accountability that sits with the named owner.",
    agencyTag: "Cross-agency",
    audience: "Program owners and EEO directors",
    estimatedMinutes: 30,
    order: 5,
    lessons: [
      {
        title: "What program ownership of an AI system actually means",
        type: "reading",
        body: "When a federal program uses an AI tool to inform decisions, one named individual carries accountability for the outcomes that tool influences. That is the program owner.\n\nProgram ownership of an AI system is not the same as managing a software project. It includes:\n\n- Authority. The program owner can pause, restrict, or retire the system. That authority must be written down somewhere a third party can find it.\n- Visibility. The owner sees model performance against defined thresholds on a defined cadence, not only when something breaks.\n- Decision rights. When the system's output and a human judgment disagree, the documented policy says who decides and on what basis. For rights-impacting uses, OMB M-24-10 requires that a qualified human can override the AI determination.\n- Communication. The owner translates model behavior into language senior leadership can act on. Leadership should not need to read a confusion matrix to understand whether the system is working.\n\nIf any of those four are unclear, the system is operating without an owner, regardless of what the org chart says.",
      },
      {
        title: "Spotting unreliable outputs",
        type: "reading",
        body: "Model performance does not degrade with a flashing red light. It drifts. Recognizing drift is part of the program owner's job.\n\nFour patterns to watch for:\n\n1. Confidence without grounding. Outputs read as more certain than the underlying data supports. Spot-check against source data on a defined cadence, not only when challenged.\n2. Distribution shift. The population the model is now seeing is no longer the population it was trained on. Reorganizations, policy changes, and seasonal patterns all cause this.\n3. Sparse-cell instability. At the organizational-unit level, small denominators produce volatile findings. A 100% rate against a population of three is not the same signal as a 100% rate against a population of three hundred.\n4. Triangulation failure. Quantitative findings disagree with operational survey data (for example DEOCS) or with what frontline staff are reporting. Either signal could be the wrong one — investigation is the point.\n\nNone of these is automatically a fault. Each one is a prompt to look closer before acting on the output.",
      },
      {
        title: "Communicating AI insights to senior leadership",
        type: "reading",
        body: "Senior leadership rarely needs the model. They need the decision the model is informing.\n\nA defensible briefing on an AI-derived insight has five parts:\n\n1. The finding, in one plain-English sentence. (\"Three organizational units show a sustained gap in promotion rates over the last four quarters.\")\n2. The basis for the finding: the data, the time window, the model output, the validation method.\n3. The confidence: what the measured accuracy is on the relevant output, and what the known limitations are for this finding (for example small denominators, recent reorgs).\n4. The recommended action, with the human decision-maker explicitly named. AI recommends; authorized personnel decide.\n5. The audit trail: where the data lives, where the model output lives, where the decision will be recorded.\n\nFraming the conversation this way protects two things at once: it gives leadership the information needed to act, and it keeps the AI system inside the governance posture that the program owner is accountable for.",
      },
    ],
    quiz: {
      title: "Program-owner governance check",
      passingScore: 70,
      questions: [
        {
          prompt:
            "A model's quarterly validation shows a 100% adverse-impact finding against a workforce population of four. As program owner, your first action is to:",
          options: [
            { id: "a", label: "Brief leadership immediately on the 100% finding." },
            {
              id: "b",
              label:
                "Investigate sparse-cell instability — a percentage against a denominator of four is not a comparable signal to one against a larger population.",
            },
            { id: "c", label: "Retrain the model." },
            { id: "d", label: "Suppress the finding from the dashboard." },
          ],
          correctOptionId: "b",
          explanation:
            "Sparse-cell instability is one of the named patterns to watch for. The right move is to investigate the basis of the finding before acting on it or escalating it.",
        },
        {
          prompt:
            "For a rights-impacting AI determination, OMB M-24-10 requires that:",
          options: [
            { id: "a", label: "A second model independently confirm the determination." },
            { id: "b", label: "A qualified human can override the AI determination." },
            { id: "c", label: "The determination be published publicly." },
            { id: "d", label: "The model be retrained after each determination." },
          ],
          correctOptionId: "b",
          explanation:
            "Human override authority for rights-impacting uses is a core requirement of M-24-10 and is the program owner's responsibility to operationalize.",
        },
        {
          prompt:
            "Which of the following belongs in a defensible briefing on an AI-derived finding to senior leadership?",
          options: [
            { id: "a", label: "The model's full architecture diagram." },
            { id: "b", label: "Only the headline finding, to keep leadership focused." },
            {
              id: "c",
              label:
                "The finding, the basis, the confidence and known limitations, the recommended action with the named human decision-maker, and the audit trail.",
            },
            { id: "d", label: "The raw model output, unedited, so leadership can decide for themselves." },
          ],
          correctOptionId: "c",
          explanation:
            "Leadership needs to act, not to reproduce the analysis. The five-part structure gives them what they need to decide while keeping the system inside its governance posture.",
        },
      ],
    },
  },
];
