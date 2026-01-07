import { motion } from "framer-motion";
import { ArrowLeft, Upload, Sparkles, MessageSquare, Zap, Shield, Brain, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Upload,
    title: "Upload PDF",
    description: "Simply drag and drop or select your government PDF document. Our system accepts files up to 50MB.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Multi-Model Analysis",
    description: "Multiple AI models (GPT-4, Claude, Grok, Gemini) work together to extract and analyze the content, ensuring comprehensive understanding.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Sparkles,
    title: "Intelligent Processing",
    description: "Advanced RAG (Retrieval Augmented Generation) technology processes the document to create a searchable knowledge base.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: MessageSquare,
    title: "Chat with AI",
    description: "Ask questions about the document and get instant, accurate answers with source citations from the original PDF.",
    color: "from-green-500 to-emerald-500"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between">
        <Link href="/">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/logo.jpg" 
              alt="Thunaivan Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
              Thunaivan
            </span>
          </motion.div>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 dark:text-white mb-4">
            How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Experience the power of multiple AI models working together to understand and analyze government documents
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                  
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="absolute top-4 right-4 text-6xl font-bold text-slate-100 dark:text-slate-800">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Why Multiple AI Models?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
            >
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Accuracy</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Cross-validation across multiple models ensures higher accuracy
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
            >
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Reliability</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Multiple perspectives reduce bias and improve understanding
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
            >
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Comprehensive</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Each model brings unique strengths to the analysis
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
              Get Started
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

