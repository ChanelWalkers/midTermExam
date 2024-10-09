import { useState} from 'react'
import { StyleSheet, View, Text, Button, TextInput, Alert, ScrollView } from 'react-native';
import { Provider as PaperProvider, Card, Snackbar } from 'react-native-paper';
import { auth } from '../config/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import HomeScreen from './HomeScreen';
import { useNavigation } from '@react-navigation/native';



function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
   

    // useEffect(()=>{

    // },[]);

   

    const navigation = useNavigation();
    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Email hoặc mật khẩu không được để trống bạn nhé',
                [{ text: 'Đã rõ', style: 'default' }]
            );
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                Alert.alert('Thành Công', 'Bạn đã đăng nhập thành công!!!',
                    [{ text: 'OK', style: 'default' }]
                );
                navigation.navigate('Home');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                Alert.alert('Thành Công', 'Bạn đã đăng ký thành công!!!',
                    [{ text: 'OK', style: 'default' }]);
                // console.log('Sign up successful');
                setPassword('');
                setEmail('');
            }
        } catch (error) {
            setErrorMessage(error.message);
            setSnackbarVisible(true);
        }
    };
    return (
        <PaperProvider>
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.tabContainer}>
                            <Button title="Login" onPress={() => setIsLogin(true)} />
                            <Button title="Sign Up" onPress={() => setIsLogin(false)} />
                        </View>
                        <TextInput
                            placeholder="Email"
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            mode="outlined"
                        />
                        <TextInput
                            placeholder="Password"
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            secureTextEntry
                            mode="outlined"
                        />
                        <Button title={isLogin ? "Login" : "Sign Up"} onPress={handleSubmit} />
                    </Card.Content>
                </Card>
            </ScrollView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {errorMessage}
            </Snackbar>
        </PaperProvider>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#84fab0',
    },
    card: {
        padding: 16,
        borderRadius: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
        // borderColor: '#ccc',
    },
});

export default LoginScreen;