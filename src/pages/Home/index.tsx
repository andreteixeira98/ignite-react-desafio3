import { useEffect, useState } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { ProductList } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

// interface ProductFormatted extends Product {
//   priceFormatted: string;
// }

interface CartItemsAmount {
  [key: number]: number;
}    

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = products.reduce((sumAmount, productInHome) => {
     
    let prod = cart.find(productInCart => productInHome.id === productInCart.id 
    );
   
    return {...sumAmount, [productInHome.id]:prod?.amount ?? 0 };
  }, {
   
  } as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      const {data} = await api.get('/products');

      setProducts(data);

    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map(product=>{
        return (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{formatPrice(product.price)}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id]}
              </div>
              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      })}
    </ProductList>
  );
};

export default Home;
