import { create } from 'zustand';

const useStore = create((set) => ({
  posts: [],
  cart: [],
  communityCarbonOffset: 0,
  
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (postId) => set((state) => ({ 
    posts: state.posts.filter(p => p.id !== parseInt(postId)) 
  })),
  updatePostLikes: (postId, delta) => set((state) => ({
    posts: state.posts.map(p => 
      p.id === parseInt(postId) ? { ...p, likesCount: (p.likesCount || 0) + delta } : p
    )
  })),
  
  addToCart: (product) => set((state) => {
    const newCart = [...state.cart, product];
    // Calculate total impact
    const totalOffset = newCart.reduce((acc, p) => acc + (5.0 - (p.carbon_per_unit || 1.0)), 0);
    return { cart: newCart, communityCarbonOffset: totalOffset };
  }),
  
  removeFromCart: (productId) => set((state) => {
    const newCart = state.cart.filter(p => p.id !== productId);
    const totalOffset = newCart.reduce((acc, p) => acc + (5.0 - (p.carbon_per_unit || 1.0)), 0);
    return { cart: newCart, communityCarbonOffset: totalOffset };
  }),
}));

export default useStore;
