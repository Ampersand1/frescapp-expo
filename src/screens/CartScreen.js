import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { auth, db } from '../services/firebase';

export default function CartScreen() {
  const [cart, setCart] = useState(null);

  useEffect(()=> {
    const loadCart = async () => {
      try {
        const userId = auth.currentUser.uid;
        const q = query(collection(db, 'carts'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) setCart(snap.docs[0]);
        else setCart(null);
      } catch (e) {
        console.log(e);
      }
    };
    loadCart();
  }, []);

  if (!cart) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Carrito vacío</Text></View>;

  const data = cart.data();

  return (
    <View style={{flex:1, padding:12}}>
      <FlatList
        data={data.items || []}
        keyExtractor={(i,idx)=>i.productId + idx}
        renderItem={({item}) => (
          <View style={{padding:8, borderBottomWidth:1, borderColor:'#eee'}}>
            <Text style={{fontWeight:'600'}}>{item.name}</Text>
            <Text>Cantidad: {item.quantity}</Text>
            <Text>Precio: ${item.priceAtAdd}</Text>
          </View>
        )}
      />
      <Button title="Ir a pagar (simulado)" onPress={() => alert('Funcionalidad de pago no implementada')} />
    </View>
  );
}
