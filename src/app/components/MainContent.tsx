"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  ChevronLeft, ChevronRight, Clock, X, Search, Filter, SortAsc, Plus, Sparkles, TrendingUp, Calendar, Code,
  Star, Download, Share2, Users, Activity, Zap, FolderOpen, MoreHorizontal, CheckSquare, Square, 
  ExternalLink, Copy, Archive, Trash2, Heart, Eye, Edit3, Settings, ShoppingCart, FileText, User
} from "lucide-react";
import InputForm from "./InputForm";
import ProjectHistory from "./ProjectHistory";
import ReactDOM from "react-dom";

export default function MainContent() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [currentCode, setCurrentCode] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Load current code from sessionStorage
  useEffect(() => {
    const savedCode = sessionStorage.getItem("generatedCode");
    if (savedCode) {
      setCurrentCode(savedCode);
    }
  }, []);

  // Listen for changes in sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCode = sessionStorage.getItem("generatedCode");
      if (savedCode) {
        setCurrentCode(savedCode);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoadProject = (code: string) => {
    // Save the code to sessionStorage
    sessionStorage.setItem("generatedCode", code);
    setCurrentCode(code);
    
    // Navigate to the output page to display the loaded project
    router.push("/output");
  };

  const handleCreateNew = () => {
    setIsSidebarOpen(false);
    // Focus on the input form
    const inputForm = document.querySelector('textarea[name="prompt"]') as HTMLTextAreaElement;
    if (inputForm) {
      inputForm.focus();
    }
  };

  const handleBulkAction = (action: string) => {
    // Handle bulk actions
    console.log(`Bulk action: ${action}`, selectedProjects);
    setBulkMode(false);
    setSelectedProjects([]);
  };

  const handleExport = (format: string) => {
    console.log(`Export as ${format}`);
  };

  const handleShare = (projectId: string) => {
    console.log(`Share project: ${projectId}`);
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await fetch(`/api/projects/${projectToDelete}`, { method: "DELETE" });
      setShowDeleteDialog(false);
      setProjectToDelete(null);
      // Optionally refresh project list here
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const categories = [
    { id: "all", name: "All Projects", icon: FolderOpen, count: 12 },
    { id: "landing", name: "Landing Pages", icon: ExternalLink, count: 4 },
    { id: "dashboard", name: "Dashboards", icon: TrendingUp, count: 3 },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingCart, count: 2 },
    { id: "blog", name: "Blogs", icon: FileText, count: 2 },
    { id: "portfolio", name: "Portfolios", icon: User, count: 1 }
  ];

  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      loadTemplates();
    }
  }, [isSignedIn]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const activityFeed = [
    { id: "1", type: "created", project: "Portfolio Website", time: "2 hours ago", user: "You" },
    { id: "2", type: "updated", project: "Dashboard", time: "1 day ago", user: "You" },
    { id: "3", type: "shared", project: "Landing Page", time: "3 days ago", user: "Team Member" },
    { id: "4", type: "exported", project: "Blog Template", time: "1 week ago", user: "You" }
  ];

  return (
    <div className="relative w-full max-w-7xl">
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 lg:${isSidebarOpen ? 'mr-80' : 'mr-0'}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <InputForm />
      </div>
      
      {/* Desktop Sidebar Toggle Button (Always Visible) */}
      <div className="hidden lg:block fixed top-32 right-0 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-l-xl flex items-center justify-center text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        {isSidebarOpen ? <button className="transition-all duration-300 mr-[368px]" /> : <button className="transition-all duration-300 mr-0" />}
      </div>
      
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-20 right-0 h-[calc(100vh-5rem)] transition-all duration-300 z-40 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ overflowY: 'auto' }}>
        {/* Sidebar Content */}
        <div className="w-80 h-full bg-black/40 backdrop-blur-sm border-l border-white/10 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Your Projects</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowActivity(!showActivity)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showActivity ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Activity Feed"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <button
              onClick={handleCreateNew}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </button>
            
            {/* Template Button */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Use Template
            </button>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Categories</h4>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  showFavorites ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
              >
                <Star className="w-3 h-3" />
                Favorites
              </button>
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-xs text-white/50">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b border-white/10">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="updated">Last Updated</option>
                  <option value="favorites">Favorites First</option>
                </select>
                <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>

              <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-1 text-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkMode && (
            <div className="p-4 border-b border-white/10 bg-yellow-500/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-yellow-400">
                  {selectedProjects.length} selected
                </span>
                <button
                  onClick={() => setBulkMode(false)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <button
                  onClick={() => handleBulkAction('share')}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="px-4 py-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>12 Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>3 This Week</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Last: 2h ago</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[calc(100vh-24rem)]">
            {showTemplates ? (
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Templates</h4>
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-white">{template.name}</h5>
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs">Use</button>
                    </div>
                    <p className="text-xs text-white/60">{template.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : showActivity ? (
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Recent Activity</h4>
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-xs text-white/80">
                        <span className="font-medium">{activity.user}</span> {activity.type} <span className="font-medium">{activity.project}</span>
                      </p>
                      <p className="text-xs text-white/50">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProjectHistory 
                currentCode={currentCode}
                onLoadProject={handleLoadProject}
                searchQuery={searchQuery}
                sortBy={sortBy}
                filterStatus={filterStatus}
                selectedCategory={selectedCategory}
                showFavorites={showFavorites}
                bulkMode={bulkMode}
                selectedProjects={selectedProjects}
                onBulkSelect={(projectId) => {
                  setSelectedProjects(prev => 
                    prev.includes(projectId) 
                      ? prev.filter(id => id !== projectId)
                      : [...prev, projectId]
                  );
                }}
                onBulkMode={() => setBulkMode(true)}
                showDeleteDialog={showDeleteDialog}
                setShowDeleteDialog={setShowDeleteDialog}
                projectToDelete={projectToDelete}
                setProjectToDelete={setProjectToDelete}
                deleteProject={deleteProject}
              />
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Press Ctrl+R to refresh</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle (visible only on mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <Clock className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Project Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
        isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 rounded-t-3xl transition-transform duration-300 ${
          isSidebarOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Back Button */}
          <div className="flex items-center px-4 pt-6 pb-2">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Your Projects</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowActivity(!showActivity)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showActivity ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Activity Feed"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-4 py-3 border-b border-white/10 space-y-2">
            <button
              onClick={handleCreateNew}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </button>
            
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Use Template
            </button>
          </div>

          {/* Categories */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Categories</h4>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  showFavorites ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
              >
                <Star className="w-3 h-3" />
                Favorites
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-white/50">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="px-4 py-3 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="updated">Last Updated</option>
                  <option value="favorites">Favorites First</option>
                </select>
                <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>

              <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-1 text-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkMode && (
            <div className="px-4 py-3 border-b border-white/10 bg-yellow-500/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-yellow-400">
                  {selectedProjects.length} selected
                </span>
                <button
                  onClick={() => setBulkMode(false)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <button
                  onClick={() => handleBulkAction('share')}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-xs flex items-center justify-center gap-1"
                >
                  <Archive className="w-3 h-3" />
                  Archive
                </button>
              </div>
            </div>
          )}
          
          {/* Stats Bar */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>12 Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>3 This Week</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Last: 2h ago</span>
              </div>
            </div>
          </div>
          
          {/* Drawer Content */}
          <div className="h-[50vh] overflow-y-auto p-4 mt-8">
            {showTemplates ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Templates</h4>
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-white">{template.name}</h5>
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs">Use</button>
                    </div>
                    <p className="text-xs text-white/60">{template.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : showActivity ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Recent Activity</h4>
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-xs text-white/80">
                        <span className="font-medium">{activity.user}</span> {activity.type} <span className="font-medium">{activity.project}</span>
                      </p>
                      <p className="text-xs text-white/50">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProjectHistory 
                currentCode={currentCode}
                onLoadProject={handleLoadProject}
                searchQuery={searchQuery}
                sortBy={sortBy}
                filterStatus={filterStatus}
                selectedCategory={selectedCategory}
                showFavorites={showFavorites}
                bulkMode={bulkMode}
                selectedProjects={selectedProjects}
                onBulkSelect={(projectId) => {
                  setSelectedProjects(prev => 
                    prev.includes(projectId) 
                      ? prev.filter(id => id !== projectId)
                      : [...prev, projectId]
                  );
                }}
                onBulkMode={() => setBulkMode(true)}
                showDeleteDialog={showDeleteDialog}
                setShowDeleteDialog={setShowDeleteDialog}
                projectToDelete={projectToDelete}
                setProjectToDelete={setProjectToDelete}
                deleteProject={deleteProject}
              />
            )}
          </div>

          {/* Bottom Actions */}
          <div className="px-4 py-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Swipe down to refresh</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for delete warning */}
      {showDeleteDialog && typeof window !== "undefined" && typeof document !== "undefined" && document.body
        ? ReactDOM.createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Delete Project?</h2>
                <p className="mb-6 text-gray-700">Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    onClick={deleteProject}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
} 