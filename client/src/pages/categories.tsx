import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Category, InsertCategory } from "@shared/schema";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#5E81AC");
  const [categorySlug, setCategorySlug] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categorySlug.trim()) {
      toast({
        title: "Invalid input",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCategory: InsertCategory = {
        name: categoryName,
        slug: categorySlug,
        color: categoryColor,
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories(prev => [...prev, createdCategory]);
        resetForm();
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      toast({
        title: "Invalid input",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedCategory = {
        name: categoryName,
        color: categoryColor,
      };

      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        const updated = await response.json();
        setCategories(prev => 
          prev.map(cat => cat.id === editingCategory.id ? updated : cat)
        );
        resetForm();
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category? All associated tasks will have this category removed.")) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(prev => prev.filter(cat => cat.id !== categoryId));
          toast({
            title: "Success",
            description: "Category deleted successfully",
          });
        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategorySlug(category.slug);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryColor("#5E81AC");
    setCategorySlug("");
    setEditingCategory(null);
  };

  function isLightColor(color: string) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (0-255)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if light, false if dark
    return brightness > 128;
  }

  // Auto-generate a slug from the name
  const handleNameChange = (name: string) => {
    setCategoryName(name);
    // Only auto-generate slug if in create mode and user hasn't manually edited the slug
    if (dialogMode === "create") {
      setCategorySlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#2E3440]">Key Activities</h1>
        <Button 
          onClick={openCreateDialog}
          className="bg-[#5E81AC] hover:bg-[#5E81AC]/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Activity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-white p-5 rounded-lg shadow-sm border border-[#E5E9F0]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div 
                    className="w-5 h-5 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEdit(category)}
                    className="p-1 text-gray-500 hover:text-[#5E81AC]"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-500 hover:text-[#BF616A]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Identifier: {category.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>
            {dialogMode === "create" ? "Add New Activity" : "Edit Activity"}
          </DialogTitle>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Work Projects"
              />
            </div>
            
            {dialogMode === "create" && (
              <div className="grid gap-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  Identifier (URL slug)
                </label>
                <Input
                  id="slug"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g., work-projects"
                />
                <p className="text-xs text-gray-500">
                  Used as an identifier in URLs and data. Can only contain lowercase letters, numbers, and hyphens.
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-10 h-10 p-0 border rounded"
                />
                <div 
                  className="flex items-center justify-center w-16 h-8 rounded px-3 py-1"
                  style={{ 
                    backgroundColor: categoryColor,
                    color: isLightColor(categoryColor) ? '#2E3440' : 'white'
                  }}
                >
                  Text
                </div>
                <Input
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={dialogMode === "create" ? handleCreateCategory : handleEditCategory}
              className="bg-[#5E81AC] hover:bg-[#5E81AC]/90"
            >
              {dialogMode === "create" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}