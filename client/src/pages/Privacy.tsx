import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, FileX, Server } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const privacyPoints = [
  {
    icon: Lock,
    title: "Secure Upload",
    description: "All PDF uploads are encrypted in transit and processed securely. Files are not stored permanently after analysis.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Eye,
    title: "No Data Sharing",
    description: "Your documents are never shared with third parties. All processing happens within our secure infrastructure.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: FileX,
    title: "Temporary Storage",
    description: "Documents are only stored temporarily during analysis. You can request deletion at any time.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Server,
    title: "Encrypted Processing",
    description: "All AI processing happens on encrypted servers with strict access controls and monitoring.",
    color: "from-green-500 to-emerald-500"
  }
];

export default function Privacy() {
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
              src="/Logo.png" 
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Privacy & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Security</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Your privacy and data security are our top priorities
          </p>
        </motion.div>

        {/* Privacy Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {privacyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${point.color} mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {point.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy Policy Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Commitment</h2>
          
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              At Thunaivan, we understand that government documents often contain sensitive information. 
              We've built our platform with privacy and security as foundational principles.
            </p>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6">Data Handling</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>PDFs are processed in-memory and not permanently stored</li>
              <li>All data transmission is encrypted using TLS 1.3</li>
              <li>Analysis results are stored temporarily and can be deleted on request</li>
              <li>No document content is used for training AI models</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6">AI Processing</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Multiple AI models process documents independently</li>
              <li>No data is shared between AI providers</li>
              <li>All API calls are made securely with encrypted payloads</li>
              <li>Processing logs are minimal and don't contain document content</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6">Your Rights</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Request deletion of your analysis data at any time</li>
              <li>Access logs of when your documents were processed</li>
              <li>Opt-out of any data collection (though we collect minimal data)</li>
            </ul>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Questions about privacy? Contact us at{" "}
            <a href="mailto:privacy@thunaivan.ai" className="text-primary hover:underline">
              privacy@thunaivan.ai
            </a>
          </p>
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

