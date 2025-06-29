
import React, { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image?: string;
}

const Stock = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Beras Premium 5kg', category: 'Sembako', price: 75000, stock: 20, barcode: '1234567890123' },
    { id: '2', name: 'Minyak Goreng 1L', category: 'Sembako', price: 18000, stock: 5, barcode: '1234567890124' },
    { id: '3', name: 'Gula Pasir 1kg', category: 'Sembako', price: 14000, stock: 0, barcode: '1234567890125' },
    { id: '4', name: 'Indomie Goreng', category: 'Makanan Instan', price: 3500, stock: 100, barcode: '1234567890126' },
    { id: '5', name: 'Teh Botol Sosro', category: 'Minuman', price: 4000, stock: 8, barcode: '1234567890127' },
    { id: '6', name: 'Sabun Mandi Lifebuoy', category: 'Kebersihan', price: 8500, stock: 30, barcode: '1234567890128' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    barcode: ''
  });

  const { toast } = useToast();

  const categories = ['Sembako', 'Makanan Instan', 'Minuman', 'Kebersihan', 'Snack', 'Frozen Food'];

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Habis', variant: 'destructive' as const, className: 'stock-empty' };
    if (stock < 10) return { status: 'Sedikit', variant: 'secondary' as const, className: 'stock-low' };
    if (stock <= 50) return { status: 'Normal', variant: 'secondary' as const, className: 'stock-normal' };
    return { status: 'Banyak', variant: 'secondary' as const, className: 'stock-abundant' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    let matchesStock = true;
    if (filterStock === 'empty') matchesStock = product.stock === 0;
    else if (filterStock === 'low') matchesStock = product.stock > 0 && product.stock < 10;
    else if (filterStock === 'normal') matchesStock = product.stock >= 10 && product.stock <= 50;
    else if (filterStock === 'abundant') matchesStock = product.stock > 50;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Harap isi semua field dengan benar",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', category: '', price: 0, stock: 0, barcode: '' });
    setShowAddDialog(false);
    
    toast({
      title: "Produk Ditambahkan",
      description: `${product.name} berhasil ditambahkan`,
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    setProducts(products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ));
    
    setEditingProduct(null);
    setShowEditDialog(false);
    
    toast({
      title: "Produk Diperbarui",
      description: "Data produk berhasil diperbarui",
    });
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setShowEditDialog(true);
  };

  const stockSummary = {
    total: products.length,
    empty: products.filter(p => p.stock === 0).length,
    low: products.filter(p => p.stock > 0 && p.stock < 10).length,
    normal: products.filter(p => p.stock >= 10 && p.stock <= 50).length,
    abundant: products.filter(p => p.stock > 50).length,
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Kelola Stok Produk</h1>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                    placeholder="Masukkan harga"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    placeholder="Masukkan stok"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    placeholder="Masukkan barcode"
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Tambah Produk
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          {/* Stock Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stockSummary.total}</div>
                <div className="text-sm text-muted-foreground">Total Produk</div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stockSummary.empty}</div>
                <div className="text-sm text-muted-foreground">Habis</div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stockSummary.low}</div>
                <div className="text-sm text-muted-foreground">Sedikit</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stockSummary.normal}</div>
                <div className="text-sm text-muted-foreground">Normal</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stockSummary.abundant}</div>
                <div className="text-sm text-muted-foreground">Banyak</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari produk atau barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStock} onValueChange={setFilterStock}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status Stok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Stok</SelectItem>
                    <SelectItem value="empty">Habis</SelectItem>
                    <SelectItem value="low">Sedikit (&lt;10)</SelectItem>
                    <SelectItem value="normal">Normal (10-50)</SelectItem>
                    <SelectItem value="abundant">Banyak (&gt;50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const stockInfo = getStockStatus(product.stock);
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="aspect-square bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Harga:</span>
                        <span className="font-medium">Rp {product.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Stok:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{product.stock}</span>
                          <Badge variant={stockInfo.variant} className={stockInfo.className}>
                            {stockInfo.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Barcode:</span>
                        <span className="text-xs font-mono">{product.barcode}</span>
                      </div>
                    </div>
                    {product.stock === 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center text-red-700 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Stok habis, segera restock!
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Tidak ada produk yang ditemukan</p>
            </div>
          )}
        </main>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nama Produk</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-price">Harga</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stok</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-barcode">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                  />
                </div>
                <Button onClick={handleEditProduct} className="w-full">
                  Simpan Perubahan
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Stock;
