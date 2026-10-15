export const GENERAL_DRAW_TERMS_VERSION = "draft-2026-10-15-v2";

const sections = [
  {
    "id": "scope",
    "title": "Scope and promoter",
    "text": "This draft framework is intended for all future Luxe Prize Draw Ltd draws. It is not final official rules or evidence of legal approval. The promoter is Luxe Prize Draw Ltd, company number SC888447. Its current registered office is 40 Donaldson Avenue, Stevenston, KA20 4EJ, Scotland. These details are confirmed by the company owner and have not been independently verified. The registered office is not an approved postal-entry address. Any launch address change must be reflected in the published company information and final draw rules before entry opens. No draw is open on this pre-launch site."
  },
  {
    "id": "eligibility",
    "title": "Eligibility",
    "text": "The proposed minimum age is 18. Each draw must state the permitted territories and any additional eligibility restrictions before entry opens. The Gambling Act 2005 framework applies to Great Britain; Northern Ireland and other jurisdictions require separate review. Promoter staff, people involved in administering the draw and their immediate households are excluded. Proportionate age, identity and residence checks may be required; only information necessary for those checks should be requested."
  },
  {
    "id": "draw-rules",
    "title": "Rules for each draw",
    "text": "These general terms must be read with the approved, versioned rules for the individual draw. Before entry, those rules must state opening and closing dates and time zone, entry price and all costs, free-entry instructions, entry limits, prize number and description, any cash alternative, selection method, draw date, notification and claim deadlines, and delivery arrangements. Significant conditions must appear alongside the promotion, not only in these terms. Draw-specific rules may clarify these terms but cannot remove statutory rights or introduce undisclosed disadvantages. Keep a copy of the rules applicable when you enter."
  },
  {
    "id": "free-entry",
    "title": "Free postal entry and equal treatment",
    "text": "For any draw offering paid and free entry, entrants must have a genuine choice to participate without paying the promoter. Ordinary first- or second-class post may be used; normal postage costs are payable to the postal service. Special or recorded delivery, premium-rate services and additional entry fees must not be required. The approved draw rules must publish the actual postal address, required entrant details, draw identifier, receipt deadline and how entries are acknowledged or checked. Do not send postal entries now: no approved postal address or open draw is provided on this prototype."
  },
  {
    "id": "equal-treatment",
    "title": "Equal entry conditions",
    "text": "The free route must be prominently displayed alongside the paid route before purchase, meet the applicable requirements on normal-rate cost and convenience, and allow sufficient time for entries to be received and processed. All valid free and paid entries must join the same eligible-entry pool with the same chance per entry and access to the same prizes; prize allocation must not distinguish the routes. Any entry limits and eligibility conditions must be clearly disclosed and applied fairly to both routes. Do not assume account purchases, membership or paid credits are needed for free entry. The actual route and operating process require legal review before launch."
  },
  {
    "id": "skill",
    "title": "Skill-based competitions",
    "text": "Any skill, knowledge or judgement requirement, assessment criteria and judging process must be disclosed before entry. A simple trivia question or repeated attempts do not automatically meet the statutory test for a prize competition. The promoter must obtain legal review of the actual challenge and retain evidence that it meets the applicable threshold; these terms do not establish an exemption. A game or loyalty activity on this prototype does not create a valid competition entry."
  },
  {
    "id": "entries",
    "title": "Entries and payments",
    "text": "Only entries accepted under the approved draw rules may participate. Entrants must provide accurate details; proportionate checks may identify duplicates, automated abuse or fraud. Disqualification must have an evidenced, fair reason under the published rules, with an opportunity to raise a complaint. Future paid entry prices, currency, payment provider, confirmation process and refund arrangements must be shown before purchase. No blanket “no refunds” rule overrides statutory rights; duplicate charges, failed entry allocation or promoter cancellation must be addressed fairly. Payments remain disabled here."
  },
  {
    "id": "selection",
    "title": "Winner selection and records",
    "text": "Chance-based draws must use a computer process producing verifiably random results or an independent person, or independent supervision. Skill competitions must use the published judging criteria and appropriate independent judging. The promoter must retain an auditable eligible-entry list, selection records and evidence of a valid award. Neither a displayed progress bar nor loyalty points establishes eligibility, improved odds or a win."
  },
  {
    "id": "prizes",
    "title": "Prizes, notification and claims",
    "text": "The advertised prize must be available before a draw opens and awarded as described, or a reasonable equivalent where the original genuinely cannot be supplied. It must not be reduced or withheld because too few paid entries were sold. Rules must disclose condition, specifications, delivery territory and costs, any optional cash alternative, and vehicle, travel or property restrictions. Winners must be contacted using the method and timetable stated before entry; reasonable attempts must be made before applying a disclosed claim deadline or selecting a replacement. Prizes should normally be delivered within 30 days of closing unless a different timetable is clearly disclosed before entry. No fee is payable to the promoter to claim a prize."
  },
  {
    "id": "changes",
    "title": "Closing dates, changes and cancellation",
    "text": "Low ticket sales are not a reason to extend a closing date, reduce a prize or cancel a draw. Closing dates may change only where unavoidable circumstances outside the promoter’s control make this necessary and entrants are not disadvantaged, or keeping the original date would be unfair to those seeking to participate under the original rules. Material rule changes are exceptional and must be communicated without unfairly altering existing entries. If lawful cancellation is genuinely necessary, entrants must be informed promptly and paid entry fees refunded; statutory rights and any obligation to award a prize remain unaffected. This draft must not be applied retrospectively to existing promotions."
  },
  {
    "id": "privacy",
    "title": "Privacy and winner information",
    "text": "Before collecting entry data, the promoter must publish a separate privacy notice explaining purposes, lawful bases, recipients, retention and data-subject rights under UK GDPR and the Data Protection Act 2018. Entry does not require marketing consent or agreement to promotional photographs. Evidence of a valid award, ordinarily a major winner’s surname and county, may be made available; entrants must be informed before entry and allowed to object or request reduced disclosure. Necessary award information may still be supplied to the ASA if challenged. Separate permission must be obtained for optional publicity."
  },
  {
    "id": "responsible",
    "title": "Responsible participation",
    "text": "Participation is not an investment, income source or solution to financial difficulty. Never spend more than you can afford. Before paid draws launch, the promoter must publish and implement its participant-protection arrangements, account suspension and closure process, and applicable payment restrictions. This draft does not claim that these services are operational."
  },
  {
    "id": "complaints",
    "title": "Complaints, liability and governing law",
    "text": "For support or complaints, email director@luxeprizedraw.com. Each draw must explain escalation and response times before opening. Entrants may seek independent advice from Citizens Advice and exercise their statutory remedies. Nothing excludes liability for fraud, death or personal injury caused by negligence, or any liability that cannot lawfully be excluded. Subject to legal approval, the intended governing law is England and Wales, without removing mandatory protections or an entrant’s right to bring proceedings in the courts of their home jurisdiction where applicable. Scotland, Northern Ireland and overseas eligibility require specific review."
  }
] as const;

export function GeneralDrawTerms() {
  return <section aria-labelledby="general-draw-terms" className="mt-8 text-sm leading-relaxed text-white/70">
    <h2 id="general-draw-terms" className="text-2xl font-black text-white">General terms for all draws</h2>
    <p className="mt-2">Version {GENERAL_DRAW_TERMS_VERSION} · Draft for legal review, not effective entry rules.</p>
    <p className="mt-3">Support and complaints: <a href="mailto:director@luxeprizedraw.com" className="text-amber-200 underline underline-offset-4">director@luxeprizedraw.com</a></p>
    <nav aria-label="General terms sections" className="my-5 flex flex-wrap gap-3">{sections.map(section => <a key={section.id} href={`#${section.id}`} className="text-amber-200 underline underline-offset-4">{section.title}</a>)}</nav>
    <div className="space-y-6">{sections.map((section, index) => <section key={section.id} id={section.id}><h3 className="font-black text-white">{index + 1}. {section.title}</h3><p className="mt-2">{section.text}</p></section>)}</div>
    <p className="mt-6">Reference guidance: <a href="https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/free-draws-and-prize-competitions" className="text-amber-200 underline">Gambling Commission: free draws and prize competitions</a> and <a href="https://www.asa.org.uk/advice-online/promotional-marketing-prize-draws.html" className="text-amber-200 underline">ASA: prize draws</a>. Neither organisation approves this draft or this platform.</p>
  </section>;
}
