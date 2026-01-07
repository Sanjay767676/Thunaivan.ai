import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Target, Users, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Target,
    title: "Mission",
    description: "Making government information accessible and understandable through AI-powered analysis.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Leveraging cutting-edge AI technology to provide accurate, multi-perspective analysis.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Democratizing access to complex government documents for everyone.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "Building trust through transparent processes and clear source citations.",
    color: "from-green-500 to-emerald-500"
  }
];

export default function About() {
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 dark:text-white mb-4">
            About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Thunaivan</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Empowering citizens with AI-powered government document analysis
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Story</h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Thunaivan was born from a simple observation: government documents are often complex, 
              lengthy, and difficult to understand. Yet they contain critical information that affects 
              millions of lives.
            </p>
            <p>
              We set out to bridge this gap by combining the power of multiple AI models—each bringing 
              unique perspectives and strengths—to analyze and explain government documents in a way 
              that's accessible to everyone.
            </p>
            <p>
              Our multi-model approach ensures that you get not just one AI's interpretation, but a 
              comprehensive analysis that cross-validates insights across different AI systems, 
              resulting in more accurate and reliable information.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Technology</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Thunaivan leverages state-of-the-art AI models and technologies:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">AI Models</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• OpenAI GPT-4</li>
                <li>• Anthropic Claude 3.5</li>
                <li>• xAI Grok</li>
                <li>• Google Gemini</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Technologies</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• RAG (Retrieval Augmented Generation)</li>
                <li>• Multi-model consensus</li>
                <li>• Secure document processing</li>
                <li>• Real-time analysis</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-12"
        >
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
              Try Thunaivan
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

