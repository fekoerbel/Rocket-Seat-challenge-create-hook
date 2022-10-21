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
      const product = await api.get('/products/' + productId)
      const productStock = await api.get('/stock/' + productId)
      const newCart = [...cart]
      const productExists = newCart.find(product => product.id == productId)
      const stockAmout = productStock.data.amount
      const currentAmount = productExists ? productExists.amount : 0
      const amount =  currentAmount + 1
      // LÓGICA PROFESSOR
      if (amount > stockAmout) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if (productExists) {
        productExists.amount = amount
      } else {  
        const newProduct = {
          ...product.data,
          amount: 1
        }
        newCart.push(newProduct)
      }
      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))




      // ANTIGA LÓGICA
      // if (productExists) {
      //   newCart.forEach(product => {
      //     if (product.id == product.data.id) {
      //       if (productStock.data.amount > product.amount) {
      //         product.amount += 1
      //       } else {
      //         toast.error('Quantidade solicitada fora de estoque')
      //       }
      //     }
      //   })
      // } else {
      //   if (productStock.data.amount == 0) {
      //     toast.error('Quantidade solicitada fora de estoque')
      //   } else {
          
      //     product.data.amount = 1
      //     newCart.push(newProduct.data)
      //   }

      // }
      // localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      // setCart(newCart)

    } catch {
        toast.error('Erro na adição do produto');
    }
  };
  
  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart]
      const productExists = newCart.find(product => product.id == productId)

      if (productExists) {
        const productPosition = newCart.indexOf(productExists)
        newCart.splice(productPosition, 1)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        setCart(newCart)
      } else {
        throw Error()
      }



    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await api.get('/stock/' + productId)
      if (amount > productStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      } else if (amount < 1) {
        return
      } else {
        const newCart = cart.map(product => {
          if (product.id == productId) {
            product.amount = amount
          }
          return product
        })
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        setCart(newCart)
      }
      
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
