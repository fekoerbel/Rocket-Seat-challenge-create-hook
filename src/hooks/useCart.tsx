import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const newProduct = await api.get('/products/' + productId)
      const productStock = await api.get('/stock/' + productId)
      const newCart = [...cart] 
      if (newCart.find(product => product.id == newProduct.data.id)) {
        newCart.forEach(product => {
          if (product.id == newProduct.data.id) {
            if (productStock.data.amount > product.amount) {
              product.amount += 1
            } else {
              toast.error('Quantidade solicitada fora de estoque')
            }
          }
        })
      } else {
        newProduct.data.amount = 1
        newCart.push(newProduct.data)
      }
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      setCart(newCart)

    } catch {
        toast.error('Erro na adição do produto');
    }
  };
  
  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
