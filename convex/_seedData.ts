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
];
