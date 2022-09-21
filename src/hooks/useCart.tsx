import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
         const productIndexCart = cart.findIndex(product=> product.id === productId);

        if(productIndexCart>=0){
          const {data:productInStock} = await api.get(`/stock/${productId}`);

          if(productInStock.amount > cart[productIndexCart].amount){
            const product = cart[productIndexCart];
            product.amount++;
            let newCart = [...cart];
            newCart.splice(productIndexCart ,1,product);
            setCart(newCart);

            localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));
          }else{
            toast.error('Quantidade solicitada fora de estoque');
          }
        }else{
          const {data:productInProducts} = await api.get(`/products/${productId}`);

          if(productInProducts){
             setCart([
            ...cart,{...productInProducts, amount:1}
            ]);
             localStorage.setItem('@RocketShoes:cart',JSON.stringify([
            ...cart,{...productInProducts, amount:1}
            ]));
          }else{
             toast.error('Erro na adição do produto'); 
          }
        }

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {

      const productIndex = cart.findIndex(product=> product.id === productId);


      if(productIndex>=0){
        const newCart = [...cart];

        newCart.splice(productIndex,1);

        setCart(newCart);

        localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));
      }else{
        toast.error('Erro na remoção do produto');
      }
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

      if(amount <= 0) return ;
      const productIndex = cart.findIndex(product=> product.id === productId);

      if(productIndex>=0){//TODO
        const {data:productInStock} = await api.get(`/stock/${productId}`);
        if(productInStock.amount >= amount){
          const product = cart[productIndex];
          product.amount = amount;
          const newCart = [...cart];
          newCart.splice(productIndex,1,product);

          setCart(newCart);

          localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));
        }else{
          toast.error('Quantidade solicitada fora de estoque');
        }
        
      }else{
        toast.error('Erro na alteração de quantidade do produto');
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
