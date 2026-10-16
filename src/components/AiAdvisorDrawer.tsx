import React, { useState } from "react";
import { X, Sparkles, Send, RefreshCw, Bot, CheckCircle2, HelpCircle } from "lucide-react";

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEntry: () => void;
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  onOpenEntry,
}) => {
  const [messages, setMessages] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Hello! I am your Luxe Prize Draws Commercial & Legal AI Advisor. Ask me anything about UK company formation, the founder relocation programme, the 2-week 5-star luxury holiday, or your £100K cash prize.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    "What are the benefits of a UK limited company?",
    "How does the £100K cash grant get paid into my bank?",
    "What is included in the 2-week 5-star luxury holiday?",
    "How quickly is the founder relocation programme arranged?",
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/ask-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The advisor is unavailable.");
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: err instanceof Error ? err.message : "The advisor is unavailable. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-neutral-950 h-full border-l border-white/15 shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slide-left backdrop-blur-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black font-bold shadow-md">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Luxe Prize Draws AI Advisor</h3>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Live &middot; Gemini 2.5 Flash</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="py-3 flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#D4AF37] text-black font-medium rounded-tr-none"
                    : "bg-white/5 text-white/80 border border-white/10 rounded-tl-none whitespace-pre-line backdrop-blur-xl"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D4AF37] max-w-[200px]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Consulting knowledge base...</span>
            </div>
          )}
        </div>

        {/* Input & Entry CTA */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about company setup, the holiday, or app tech..."
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-3 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={() => {
              onClose();
              onOpenEntry();
            }}
            className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider border border-[#D4AF37]/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ready to win? Claim your official ticket now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
