import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

const CATEGORIES = [
  { id: "popular", title: "Popular", icon: "⭐" },
  { id: "fruits", title: "Fruits", icon: "🍎" },
  { id: "vegetables", title: "Vegetables", icon: "🥦" },
  { id: "dairy", title: "Dairy & Eggs", icon: "🥛" },
  { id: "bakery", title: "Bakery", icon: "🥐" },
  { id: "snacks", title: "Snacks", icon: "🥨" },
];

const PRODUCTS = [
  { id: "p1", category: "popular", name: "Farm fresh apples", detail: "Crisp and juicy", price: 120, unit: "4 pieces", emoji: "🍎" },
  { id: "p2", category: "popular", name: "Organic bananas", detail: "Naturally sweet", price: 50, unit: "6 pieces", emoji: "🍌" },
  { id: "p3", category: "popular", name: "Fresh milk", detail: "Full cream", price: 32, unit: "500 ml", emoji: "🥛" },
  { id: "f1", category: "fruits", name: "Red apples", detail: "Premium quality", price: 120, unit: "4 pieces", emoji: "🍎" },
  { id: "f2", category: "fruits", name: "Sweet oranges", detail: "Rich in vitamin C", price: 80, unit: "4 pieces", emoji: "🍊" },
  { id: "f3", category: "fruits", name: "Green grapes", detail: "Seedless", price: 90, unit: "500 g", emoji: "🍇" },
  { id: "v1", category: "vegetables", name: "Fresh broccoli", detail: "Farm picked", price: 65, unit: "1 piece", emoji: "🥦" },
  { id: "v2", category: "vegetables", name: "Red tomatoes", detail: "Fresh and ripe", price: 35, unit: "500 g", emoji: "🍅" },
  { id: "v3", category: "vegetables", name: "Sweet carrots", detail: "Crunchy", price: 45, unit: "500 g", emoji: "🥕" },
  { id: "d1", category: "dairy", name: "Fresh milk", detail: "Full cream", price: 32, unit: "500 ml", emoji: "🥛" },
  { id: "d2", category: "dairy", name: "Farm eggs", detail: "Pack of six", price: 60, unit: "6 pieces", emoji: "🥚" },
  { id: "d3", category: "dairy", name: "Cheddar cheese", detail: "Creamy and rich", price: 145, unit: "200 g", emoji: "🧀" },
  { id: "b1", category: "bakery", name: "Butter croissant", detail: "Flaky and soft", price: 55, unit: "1 piece", emoji: "🥐" },
  { id: "b2", category: "bakery", name: "Whole wheat bread", detail: "Freshly baked", price: 45, unit: "1 loaf", emoji: "🍞" },
  { id: "s1", category: "snacks", name: "Salted pretzels", detail: "Light and crunchy", price: 75, unit: "150 g", emoji: "🥨" },
  { id: "s2", category: "snacks", name: "Roasted almonds", detail: "Protein rich", price: 160, unit: "200 g", emoji: "🥜" },
];

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  const toggleItem = (product) => {
    setCart((current) => {
      const next = { ...current };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      return next;
    });
  };

  const cartItems = Object.values(cart);
  const count = cartItems.length;
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, toggleItem, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return value;
}

function ProductCard({ product }) {
  const { cart, toggleItem } = useCart();
  const added = Boolean(cart[product.id]);

  return (
    <View style={styles.productCard}>
      <View style={styles.productEmoji}>
        <Text style={styles.emojiText}>{product.emoji}</Text>
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDetail}>{product.detail}</Text>
      <Text style={styles.productUnit}>{product.unit}</Text>
      <View style={styles.productBottom}>
        <Text style={styles.price}>₹{product.price}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={added ? `Remove ${product.name}` : `Add ${product.name}`}
          onPress={() => toggleItem(product)}
          style={[styles.addButton, added && styles.removeButton]}
        >
          <Text style={styles.addButtonText}>{added ? "−" : "+"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AppContent() {
  const { count, total, cart } = useCart();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = width >= 760;
  const [activeCategory, setActiveCategory] = useState("popular");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const scrollRef = useRef(null);
  const sectionY = useRef({});

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PRODUCTS;
    return PRODUCTS.filter((item) =>
      `${item.name} ${item.detail} ${item.category}`.toLowerCase().includes(query)
    );
  }, [search]);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const y = sectionY.current[categoryId];
    if (typeof y === "number" && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
    }
  };

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    let currentCategory = "popular";
    CATEGORIES.forEach((category) => {
      const y = sectionY.current[category.id];
      if (typeof y === "number" && y <= currentY + 100) {
        currentCategory = category.id;
      }
    });
    setActiveCategory(currentCategory);
  };

  const visibleCategories = search
    ? CATEGORIES.filter((category) =>
        filteredProducts.some((product) => product.category === category.id)
      )
    : CATEGORIES;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>F</Text>
          </View>
          <View>
            <Text style={styles.brand}>freshcart</Text>
            <Text style={styles.tagline}>FRESH PICKS, EVERY DAY</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.deliveryText}>Deliver to</Text>
          <Text style={styles.deliveryPlace}>Hyderabad ▼</Text>
        </View>
      </View>

      <View style={styles.page}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>FRESHNESS AT YOUR DOORSTEP</Text>
          <Text style={styles.heading}>Shop your daily essentials</Text>
          <Text style={styles.subtitle}>Good food. Great prices. Delivered fresh.</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search fruits, vegetables, and more..."
            placeholderTextColor="#8A948B"
            style={styles.searchInput}
          />
        </View>

        <View style={[styles.content, isWide && styles.contentWide]}>
          {isWide && (
            <View style={styles.sidebar}>
              <Text style={styles.sidebarTitle}>CATEGORIES</Text>
              {visibleCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => scrollToCategory(category.id)}
                  style={[
                    styles.categoryButton,
                    activeCategory === category.id && styles.categoryButtonActive,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === category.id && styles.categoryTextActive,
                    ]}
                  >
                    {category.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.main}>
            {!isWide && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mobileCategories}
                contentContainerStyle={styles.mobileCategoriesContent}
              >
                {visibleCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => scrollToCategory(category.id)}
                    style={[
                      styles.mobileCategory,
                      activeCategory === category.id && styles.mobileCategoryActive,
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        activeCategory === category.id && styles.categoryTextActive,
                      ]}
                    >
                      {category.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <ScrollView
              ref={scrollRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsContent}
            >
              {visibleCategories.map((category) => {
                const products = filteredProducts.filter(
                  (product) => product.category === category.id
                );
                if (products.length === 0) return null;

                return (
                  <View
                    key={category.id}
                    onLayout={(event) => {
                      sectionY.current[category.id] = event.nativeEvent.layout.y;
                    }}
                    style={styles.categorySection}
                  >
                    <View style={styles.sectionHeadingRow}>
                      <Text style={styles.sectionTitle}>
                        {category.icon} {category.title}
                      </Text>
                      <Text style={styles.itemCount}>{products.length} items</Text>
                    </View>
                    <View style={styles.productGrid}>
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </View>
                  </View>
                );
              })}
              {filteredProducts.length === 0 && (
                <Text style={styles.emptyText}>No products found. Try another search.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {count > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarTitle}>{count} item{count === 1 ? "" : "s"} added</Text>
            <Text style={styles.cartBarTotal}>Total: ₹{total}</Text>
          </View>
          <Pressable
            style={styles.viewCartButton}
            onPress={() => setShowCart((value) => !value)}
          >
            <Text style={styles.viewCartText}>{showCart ? "HIDE CART" : "VIEW CART"}</Text>
          </Pressable>
        </View>
      )}

      {showCart && (
        <View style={styles.cartPanel}>
          <View style={styles.cartPanelHeader}>
            <Text style={styles.cartPanelTitle}>Your cart</Text>
            <Pressable onPress={() => setShowCart(false)}>
              <Text style={styles.closeCart}>Close ✕</Text>
            </Pressable>
          </View>
          {Object.values(cart).map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Text style={styles.cartItemName}>{item.emoji} {item.name}</Text>
              <Text style={styles.cartItemPrice}>₹{item.price}</Text>
            </View>
          ))}
          <Text style={styles.cartTotal}>Grand total: ₹{total}</Text>
        </View>
      )}

      <Text style={styles.footer}>FRESHLY PICKED • THOUGHTFULLY DELIVERED</Text>
    </View>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: "100%", backgroundColor: "#F7F9F5" },
  header: {
    minHeight: 76, paddingHorizontal: 24, paddingVertical: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E8EDE6",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: "#39704B",
    alignItems: "center", justifyContent: "center",
  },
  brandMarkText: { color: "#FFFFFF", fontSize: 23, fontWeight: "900" },
  brand: { marginLeft: 10, color: "#26372B", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { marginLeft: 10, color: "#7C897E", fontSize: 8, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  deliveryText: { color: "#879187", fontSize: 11 },
  deliveryPlace: { color: "#26372B", fontSize: 13, fontWeight: "700", marginTop: 3 },
  page: { flex: 1, width: "100%", maxWidth: 1240, alignSelf: "center", paddingHorizontal: 22 },
  intro: { paddingTop: 26, paddingBottom: 18 },
  eyebrow: { color: "#5D8A5E", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  heading: { color: "#26372B", fontSize: 27, fontWeight: "800", marginTop: 7 },
  subtitle: { color: "#7C897E", fontSize: 13, marginTop: 5 },
  searchInput: {
    marginTop: 18, height: 46, borderWidth: 1, borderColor: "#E1E8DE",
    borderRadius: 12, paddingHorizontal: 15, backgroundColor: "#FFFFFF",
    color: "#26372B", fontSize: 14,
  },
  content: { flex: 1 },
  contentWide: { flexDirection: "row", gap: 24 },
  sidebar: { width: 205, paddingTop: 8 },
  sidebarTitle: { color: "#899489", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 12 },
  categoryButton: {
    flexDirection: "row", alignItems: "center", paddingVertical: 13,
    paddingHorizontal: 12, borderRadius: 12, marginBottom: 5,
  },
  categoryButtonActive: { backgroundColor: "#EAF2E8" },
  categoryIcon: { fontSize: 17, marginRight: 10 },
  categoryText: { color: "#687568", fontSize: 13, fontWeight: "600" },
  categoryTextActive: { color: "#39704B", fontWeight: "800" },
  main: { flex: 1, minWidth: 0 },
  mobileCategories: { maxHeight: 54, flexGrow: 0, marginBottom: 10 },
  mobileCategoriesContent: { alignItems: "center", gap: 7, paddingVertical: 4 },
  mobileCategory: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E7ECE4",
  },
  mobileCategoryActive: { backgroundColor: "#EAF2E8", borderColor: "#C8DCC6" },
  productsContent: { paddingBottom: 115 },
  categorySection: { marginBottom: 25 },
  sectionHeadingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: "#26372B", fontSize: 18, fontWeight: "800" },
  itemCount: { color: "#929C91", fontSize: 11 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  productCard: {
    width: "31%", minWidth: 150, flexGrow: 1, maxWidth: 250,
    backgroundColor: "#FFFFFF", borderRadius: 15, padding: 13,
    borderWidth: 1, borderColor: "#E9EEE6",
  },
  productEmoji: {
    height: 92, borderRadius: 11, backgroundColor: "#F4F7F0",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  emojiText: { fontSize: 43 },
  productName: { color: "#26372B", fontSize: 13, fontWeight: "800" },
  productDetail: { color: "#879187", fontSize: 11, marginTop: 4 },
  productUnit: { color: "#9AA398", fontSize: 10, marginTop: 3 },
  productBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  price: { color: "#26372B", fontSize: 15, fontWeight: "800" },
  addButton: {
    width: 34, height: 32, borderRadius: 9, backgroundColor: "#39704B",
    alignItems: "center", justifyContent: "center",
  },
  removeButton: { backgroundColor: "#DDEBDD" },
  addButtonText: { color: "#FFFFFF", fontSize: 23, lineHeight: 26, fontWeight: "600" },
  emptyText: { color: "#687568", textAlign: "center", marginTop: 35 },
  cartBar: {
    position: "absolute", left: 18, right: 18, bottom: 18,
    backgroundColor: "#26372B", borderRadius: 15, padding: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    ...(Platform.OS === "web" ? { maxWidth: 700, alignSelf: "center", width: "90%" } : {}),
  },
  cartBarTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  cartBarTotal: { color: "#D5E5D2", fontSize: 12, marginTop: 3 },
  viewCartButton: { backgroundColor: "#FFFFFF", paddingHorizontal: 17, paddingVertical: 11, borderRadius: 10 },
  viewCartText: { color: "#26372B", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  cartPanel: {
    position: "absolute", right: 18, bottom: 88, width: 300, maxWidth: "90%",
    backgroundColor: "#FFFFFF", borderRadius: 15, padding: 16,
    borderWidth: 1, borderColor: "#E1E8DE",
    ...(Platform.OS === "web" ? { alignSelf: "flex-end" } : {}),
  },
  cartPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cartPanelTitle: { color: "#26372B", fontSize: 17, fontWeight: "800" },
  closeCart: { color: "#5D8A5E", fontSize: 12, fontWeight: "700" },
  cartItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#EEF1EC" },
  cartItemName: { color: "#475448", fontSize: 12, flex: 1 },
  cartItemPrice: { color: "#26372B", fontSize: 12, fontWeight: "700" },
  cartTotal: { color: "#26372B", fontSize: 14, fontWeight: "900", marginTop: 13, textAlign: "right" },
  footer: { color: "#A0A99E", fontSize: 9, fontWeight: "800", letterSpacing: 1.1, textAlign: "center", paddingVertical: 12 },
});
