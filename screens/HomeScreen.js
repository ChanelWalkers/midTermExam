import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, Modal, StyleSheet, Alert, Image } from 'react-native';
import { db } from '../config/firebase';
import { doc, addDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker'

function HomeScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('');
    const [productPrice, setProductPrice] = useState(0);
    const [products, setProducts] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [productImage, setProductImage] = useState(null);


    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setProductImage(result.assets[0].uri);
        }
    };


    const uploadImage = async (imageUri) => {
        try {
            console.log(imageUri);
            const response = await fetch(imageUri);
            const blob = await response.blob();
    
            const storage = getStorage();
            const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    
            await uploadBytes(storageRef, blob);
            
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.log(error);
        }
    };


    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        resetForm();
    };

    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, 'Products'));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteProduct = (id) => {
        Alert.alert('Xoá sản phẩm', 'Bạn có chắc là muốn xóa sản phẩm này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'OK',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'Products', id));
                        // console.log(id);
                        Alert.alert('Thành Công', 'Xoá Sản phẩm thành công!');
                        fetchProducts();
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xóa sản phẩm thất bại.');
                    }
                }
            },
        ]);
    }


    const addProduct = async () => {
        try {
            let imageUrl = '';
            if (productImage) {
                imageUrl = await uploadImage(productImage);
            }
            await addDoc(collection(db, 'Products'), {
                product_name: productName,
                product_type: productType,
                product_price: productPrice,
                product_img: imageUrl
            });
            closeModal();
            fetchProducts();
            Alert.alert('Thành công!!!', 'Thêm sản phẩm thành công');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const resetForm = () => {
        setProductName('');
        setProductType('');
        setProductPrice('');
        setProductImage(null);
        setEditingProductId(null);
    };

    const handleEdit = (id, name, type, price, imageUrl) => {
        setProductName(name);
        setEditingProductId(id);
        setProductType(type);
        setProductPrice(price);
        setProductImage(imageUrl || null);
        openModal();
    }

    const editProduct = async (id) => {
        try {
            let imageUrl = '';
            if (productImage) {
                imageUrl = await uploadImage(productImage);
            }
            await updateDoc(doc(db, 'Products', id), {
                product_name: productName,
                product_type: productType,
                product_price: productPrice,
                ...(imageUrl && { product_img: imageUrl }),
            });
            closeModal();
            fetchProducts();
            Alert.alert('Thành công!!!', 'Cập nhật sản phẩm thành công!!!');
        } catch (error) {
            Alert.alert('Thất bại!!!', 'Cập nhật sản phẩm thất bại!!!');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quản Lý Sản Phẩm</Text>
            <Button title="Thêm sản phẩm" onPress={openModal} />
            <FlatList
                data={products}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.item}>
                        <Text>Ten san pham: {item.product_name}</Text>
                        <Text>Loai san pham: {item.product_type}</Text>
                        <Text>Gia sp: {item.product_price}</Text>
                        <Image style ={styles.img} source={{uri:item.product_img}} />
                        <View style={styles.actionContainer}>
                            <Button title="Edit" onPress={() => handleEdit(item.id, item.product_name, item.product_type, item.product_price, item.product_img)} />
                            <Button title="Delete" onPress={() => deleteProduct(item.id)} color="red" />
                        </View>
                    </View>
                )}
            />

            <Modal visible={modalVisible} transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* <Text style={styles.modalTitle}>{editingIndex !== null ? 'Edit Employee' : 'Add Employee'}</Text> */}
                        <TextInput
                            style={styles.input}
                            placeholder="Ten san Pham"
                            value={productName}
                            onChangeText={setProductName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Loai san Pham"
                            value={productType}
                            onChangeText={setProductType}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Gia san pham"
                            value={productPrice}
                            onChangeText={setProductPrice}
                        />
                        <Button style title="Chọn ảnh" onPress={pickImage} />
                        {productImage && <Image source={{ uri: productImage }} style={styles.img} />}
                        <View style={styles.actionContainer}>
                            <Button title="Cancel" onPress={closeModal} />
                            <Button title={editingProductId ? "Update" : "Save"}
                                onPress={editingProductId ? () => editProduct(editingProductId) : addProduct} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f3f3f3',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    item: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 10,
        borderRadius: 5,
    },
    img: {
        width: 100,
        height: 100,
    },
    handleImgContainer:{
        flexDirection: 'row',
    }
});



export default HomeScreen;