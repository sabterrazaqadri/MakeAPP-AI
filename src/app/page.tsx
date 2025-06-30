import Link from "next/link";
import InputForm from "./components/InputForm";
import { Sparkles, Zap, Code, Download, Eye, Copy, ArrowRight, Star, Users, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen ">
      {/* Hero Section */}
      <section className="hero-section relative ">
        {/* Background Effects */}
        <div className="bg-pattern "></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
      
          <div className="flex flex-col z-10 items-center h-auto">
            {/* Badge */}
            <div className="inline-flex items-center  justify-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full !px-4 !py-2 !mb-8 !mt-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">AI-Powered App Generation</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl !mb-2 z-10 text-center font-bold ">
              <span className="gradient-text">Generate Apps</span>
              <br />
              <span className="text-white">with AI Magic</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl z-10 !mb-12 max-w-7xl mx-auto leading-relaxed text-center text-white/80">
              Describe your app in plain English and watch it come to life instantly. 
              Powered by advanced AI, built with React & Tailwind CSS.
            </p>

            {/* CTA Section */}
            <div className="">
              <InputForm />
            </div>

            {/* Stats */}
            <div className="grid !mb-2 z-10 grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white !mb-2">10K+</div>
                <div className="text-white/60 text-base">Apps Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white !mb-2">99%</div>
                <div className="text-white/60 text-base">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white !mb-2">&lt;60s</div>
                <div className="text-white/60 text-base">Generation Time</div>
              </div>
            </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-black/20 flex flex-col items-center backdrop-blur-sm">
          <div className="text-center  !mb-16">
            <h2 className="heading-lg !mb-6 text-white">Why Choose MakeApp AI?</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the future of app development with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid-features">
            {/* Feature 1 */}
            <div className="feature-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center !mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white !mb-4">Lightning Fast</h3>
              <p className="text-white/70 leading-relaxed text-base">
                Generate complete web applications in under 30 seconds. No waiting, no delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center !mb-6 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white !mb-4">Production Ready</h3>
              <p className="text-white/70 leading-relaxed text-base">
                Get clean, optimized React code with Tailwind CSS that's ready for deployment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center !mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white !mb-4">Live Preview</h3>
              <p className="text-white/70 leading-relaxed text-base">
                See your app in real-time as you generate it. Preview, edit, and perfect instantly.
              </p>
            </div>
          </div>
     
      </section>

      {/* Examples Section */}
      <section className="section-padding" >
        <div className="container"id="example">
          <div className="text-center !mb-12">
            <h2 className="heading-lg !mb-4 text-white">What Can You Build?</h2>
            <p className="text-xl text-white/70 max-w-7xl mx-auto">
              From simple landing pages to complex applications, our AI can handle it all
            </p>
          </div>

          <div className="grid-examples">
            {[
              {
                title: "Portfolio Website",
                description: "Professional portfolio with hero, about, and contact sections",
                prompt: "Create a portfolio with hero, about, and contact section",
                icon: "🎨"
              },
              {
                title: "E-commerce Landing",
                description: "Beautiful product showcase with pricing and features",
                prompt: "Build a landing page for a bakery with 3 menu items",
                icon: "🛍️"
              },
              {
                title: "Dashboard",
                description: "Modern admin dashboard with charts and data visualization",
                prompt: "Create a dashboard with charts and user management",
                icon: "📊"
              },
              {
                title: "Blog Platform",
                description: "Clean blog with article listings and reading experience",
                prompt: "Build a blog with article cards and reading view",
                icon: "📝"
              },
              {
                title: "SaaS Landing",
                description: "Professional SaaS website with features and pricing",
                prompt: "Create a SaaS landing page with features and pricing",
                icon: "🚀"
              },
              {
                title: "Restaurant Site",
                description: "Elegant restaurant website with menu and reservations",
                prompt: "Build a restaurant website with menu and contact form",
                icon: "🍽️"
              }
            ].map((example, index) => (
              <div key={index} className="feature-card cursor-pointer group ">
                <div className="text-3xl !mb-4">{example.icon}</div>
                <h3 className="text-lg font-semibold text-white !mb-3">{example.title}</h3>
                <p className="text-white/70 text-sm !mb-4 leading-relaxed">{example.description}</p>
                <div className="text-xs text-white/50 font-mono bg-white/5 rounded-lg !px-3 !py-2">
                  "{example.prompt}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="flex flex-col  items-center h-auto">
          <h2 className="text-[40px] text-center !mb-2 text-white">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-white/80 text-center">
            Join thousands of developers who are already creating apps faster than ever before
          </p>
          <div className="flex flex-col sm:flex-row gap-4 !mt-10 justify-center items-center">
            <Link href={'/'}><button className="btn-primary btn-large text-white">
              Start Building Now
              <ArrowRight className="w-4 h-4" />
            </button></Link>
           <Link href={"#example"}><button className="glass btn-large text-white border border-white/20 hover:bg-white/10 transition-colors">
              View Examples
            </button></Link> 
          </div>
        </div>
      </section>
    </main>
  );
}
