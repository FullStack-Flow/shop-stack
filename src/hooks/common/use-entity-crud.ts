import { useCallback, useState } from "react";

interface UseEntityCRUDOptions<_T extends { id: string }> {
  onDelete: (id: string) => Promise<void>;
}

interface UseEntityCRUDReturn<T extends { id: string }> {
  // Dialog state
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;

  // Editing state
  editingItem: T | null;
  setEditingItem: (item: T | null) => void;

  // Deleting state
  deletingItem: T | null;
  setDeletingItem: (item: T | null) => void;

  // Handlers
  handleAdd: () => void;
  handleEdit: (item: T) => void;
  handleDelete: (item: T) => void;
  confirmDelete: () => Promise<void>;
  handleDialogClose: () => void;
}

export function useEntityCRUD<T extends { id: string }>(
  options: UseEntityCRUDOptions<T>,
): UseEntityCRUDReturn<T> {
  const { onDelete } = options;

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Entity states
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item: T) => {
    setDeletingItem(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await onDelete(deletingItem.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setDeletingItem(null);
    }
  }, [deletingItem, onDelete]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingItem(null);
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleDialogClose,
  };
}
