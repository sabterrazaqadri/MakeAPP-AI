"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Clock, 
  FileText, 
  Edit, 
  Eye, 
  Download, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  Code,
  Sparkles,
  RefreshCw,
  Plus,
  CheckSquare,
  Star,
  Share2
} from "lucide-react";

interface Project {
  _id: string;
  title: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
  isPublic?: boolean;
}

interface Template {
  _id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectHistoryProps {
  currentCode: string;
  onLoadProject: (code: string) => void;
  searchQuery?: string;
  sortBy?: string;
  filterStatus?: string;
  selectedCategory?: string;
  showFavorites?: boolean;
  bulkMode?: boolean;
  selectedProjects?: string[];
  onBulkSelect?: (projectId: string) => void;
  onBulkMode?: () => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  projectToDelete: string | null;
  setProjectToDelete: (id: string | null) => void;
  deleteProject: () => void;
}

export default function ProjectHistory({ 
  currentCode, 
  onLoadProject, 
  searchQuery = "", 
  sortBy = "recent", 
  filterStatus = "all",
  selectedCategory = "all",
  showFavorites = false,
  bulkMode = false,
  selectedProjects = [],
  onBulkSelect,
  onBulkMode,
  showDeleteDialog,
  setShowDeleteDialog,
  projectToDelete,
  setProjectToDelete,
  deleteProject
}: ProjectHistoryProps) {
  const { isSignedIn } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      loadProjects();
      loadTemplates();
    }
  }, [isSignedIn]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error("Failed to load projects:", response.status);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const downloadProject = (project: Project) => {
    const blob = new Blob([project.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const editProject = (project: Project) => {
    onLoadProject(project.code);
  };

  const handleFavorite = async (projectId: string) => {
    try {
      const project = projects.find(p => p._id === projectId);
      if (!project) return;

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !project.isFavorite
        }),
      });

      if (response.ok) {
        setProjects(prev => prev.map(p => 
          p._id === projectId 
            ? { ...p, isFavorite: !p.isFavorite }
            : p
        ));
      } else {
        console.error("Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  const handleShare = (projectId: string) => {
    // Share project
    console.log(`Share project: ${projectId}`);
  };

  const handleExport = (projectId: string, format: string) => {
    // Export project
    console.log(`Export project ${projectId} as ${format}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Search filter
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !project.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== "all") {
        return project.category === selectedCategory;
      }
      
      // Favorites filter
      if (showFavorites) {
        return project.isFavorite === true;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "favorites":
          // Sort favorites first, then by recent
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category?: string) => {
    const icons: { [key: string]: string } = {
      landing: "🌐",
      dashboard: "📊",
      ecommerce: "🛍️",
      blog: "📝",
      portfolio: "🎨",
      saas: "🚀",
      other: "📁"
    };
    return icons[category || "other"] || "📁";
  };

  const getCategoryName = (category?: string) => {
    const names: { [key: string]: string } = {
      landing: "Landing Page",
      dashboard: "Dashboard",
      ecommerce: "E-commerce",
      blog: "Blog",
      portfolio: "Portfolio",
      saas: "SaaS",
      other: "Other"
    };
    return names[category || "other"] || "Other";
  };

  if (!isSignedIn) {
    return (
      <div className="glass border border-white/10 rounded-2xl p-6 h-fit">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-white/60" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Sign in to view projects</h3>
          <p className="text-white/60 text-xs">Your projects will be synced across devices</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass border border-white/10 rounded-2xl p-4 h-fit">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Projects</h3>
              <p className="text-white/60 text-xs">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!bulkMode && (
              <button
                onClick={onBulkMode}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                title="Bulk actions"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={loadProjects}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh projects"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/60 text-xs">Loading your projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white/60" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1">No projects found</h4>
              <p className="text-white/60 text-xs mb-3">
                {searchQuery ? 'Try adjusting your search' : 'Generate an app and save it from the output page'}
              </p>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white/70 text-xs">
                <Plus className="w-3 h-3" />
                Create your first project
              </div>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project._id}
                className={`group relative bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${
                  selectedProjects.includes(project._id) ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
                }`}
              >
                {/* Bulk Selection Checkbox */}
                {bulkMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={() => onBulkSelect?.(project._id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedProjects.includes(project._id)
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {selectedProjects.includes(project._id) && <CheckSquare className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                {/* Project Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500/20 to-purple-00/20 rounded-md flex items-center justify-center">
                        <span className="text-xs">{getCategoryIcon(project.category)}</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm truncate">
                        {project.title}
                      </h4>
                      <button
                        onClick={() => handleFavorite(project._id)}
                        className={`transition-colors ${
                          project.isFavorite 
                            ? 'text-yellow-400' 
                            : 'text-white/40 hover:text-yellow-400'
                        }`}
                        title={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={`w-3 h-3 ${project.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-1 text-white/50 text-xs mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-white/70 text-xs leading-relaxed mb-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-white/50 text-xs">+{project.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center">
                    <button
                      onClick={() => editProject(project)}
                      className="flex items-center gap-1 text-white/70 hover:text-white px-1 py-1 hover:bg-white/10 rounded-md transition-all duration-200 text-xs font-medium"
                      title="Edit project"
                    >
                      <Edit className="w-2.5 h-2.5" />
                      Edit
                    </button>
                  
                    <button
                      onClick={() => downloadProject(project)}
                      className="flex items-center gap-1 text-white/70 hover:text-white px-1 py-1 hover:bg-white/10 rounded-md transition-all duration-200 text-xs font-medium"
                      title="Download project"
                    >
                      <Download className="w-2.5 h-2.5" />
                      Download
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(project._id)}
                      className="flex items-center gap-1 text-white/70 hover:text-white px-1 py-1 hover:bg-white/10 rounded-md transition-all duration-200 text-xs font-medium"
                      title="Share project"
                    >
                      <Share2 className="w-2.5 h-2.5" />
                      Share
                    </button>
                    <button
                      onClick={() => { setProjectToDelete(project._id); setShowDeleteDialog(true); }}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300  py-1 hover:bg-red-500/10 rounded-md transition-all duration-200 text-xs font-medium"
                      title="Delete project"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
} 