import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({route}) => ({
      headerShown:false,
      tabBarIcon: ({color, size}) => {
        let name = 'home';
        if (route.name === 'Home') name = 'home';
        if (route.name === 'Cart') name = 'cart';
        if (route.name === 'Profile') name = 'person';
        return <Ionicons name={name} size={size} color={color} />;
      }
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
