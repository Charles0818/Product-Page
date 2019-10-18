
"use strict";
////////////////  POP  UP MODAL AND DISPLAY OF PRODUCT IMAGES IN MODAL VIA LOOP
let modal = document.querySelector('.modal');
let expandItem = document.querySelectorAll('.fa-expand-arrows-alt');
let collapse = document.querySelector('.close');

let moreImages = document.querySelector('.images-container .more-images');
let images = moreImages.getElementsByTagName('img');
let displayArea = document.querySelector('.viewArea img');
const cartSection = document.querySelector('[data-cart--session]');
const toggleCart = document.querySelectorAll('.toggle-cart');
let displayCartItems = document.querySelector('.item-list');
const clearCartBtn = document.querySelector('#clear-cart');

    
let itemArray =[];
let cart = [];

class FetchData {
    async getProducts() {
        const apiKey = "./products.json";
        try {
            let result = await fetch(`${apiKey}`)
            const data = await result.json();
            let products = data.products;
            products = products.map(product => {
                // const id = products.id;
                const categories = [...product.categories];
                const {productName, price, id } = product;
                const {thumbnail, others} = product.images
                return {id, categories, thumbnail, others, productName, price}
            });
            console.log(products);
            return products
        } catch (error) {
            console.log(error)
        }
    }
}

class UI extends FetchData {

    displayProducts(products) {
        console.log(products)
        let productsDOM = document.querySelector('.shop_menu');
        products.forEach(product => {
            productsDOM.innerHTML += this.productTemplate(product);
        });
    }

    productTemplate( product ) {
        let result = '';
        const {id, categories, thumbnail, others, productName, price} = product;
        result += `
        <div class="shop_item" data-id="${id}" data-category="${[...categories]}">
            <div class="product-image">
                <img id="thumbnail" src="${thumbnail}" alt="">
                <div class="more-images">
                    ${others.map(imageUrl => `<img src="${imageUrl}" alt="">`)}
                </div>
                <div class="product-nav-btns">
                    <i class="fas fa-shopping-cart cartBtn" data-id = ${id}></i></i>
                    <i class="fas fa-expand-arrows-alt" data-id = ${id}></i>
                </div>
            </div>
            <div class="product-info">
                <a href="#"><h4 class="product-name">${productName}</h4></a>
                <h5 class="price">$${price}</h5>
            </div>
        </div>
        `
        return result
    }

    cartItemTemplate(item) {
        const div = document.createElement('div');
        div.classList.add('item_in_cart');
        const {thumbnail, id, productName, price, qty} = item
        div.innerHTML = `
            <li class="item_in_cart" data-id="${id}">
                <div class="item_details">
                    <img src="${thumbnail}" alt="" class="item_img">
                    <div class="item_pro">
                        <h3 class="product_name">${productName}</h3>
                        <span class="price">Price: $${price}</span>
                        <span class="item_total_price">Total:  ${price}</span>
                    </div>
                </div>

                <div class="qty">
                    <i class="fas fa-minus"></i>
                    <span class="value">${qty}</span>
                    <i class="fas fa-plus"></i>
                </div>
                <i class="far fa-trash-alt remove-item"></i>
            </li>;
        `
        console.log(div);
        return div
    }

    static findProduct(products, id) {
        const product = products.find(product => product.id === id);
        return product
    }

    addToCart() {
        const cartBtns = [...document.querySelectorAll('.cartBtn')];
        cartBtns.forEach(btn => {
            const id = btn.dataset.id;
            let product = cart.find(item => item.id == id);
            console.log(product)
            if(product){
                btn.disabled = true;
            }
            else {
                btn.addEventListener('click', event => {
                    event.target.disabled;
                    //get produt
                    let cartItem = {...LocalStorage.getProduct(id), qty: 1};
                    console.log(cartItem);

                    //add product to cart
                    cart = [...cart, cartItem];
                    console.log(cart)
                    //save Cart to LocalStorage
                    LocalStorage.saveCart(cart);

                    //update the cart
                    this.updateCartValue(cart);

                    //display cart items
                    displayCartItems.appendChild(this.cartItemTemplate(cartItem));

                    //Show Cart
                    this.slideSideNav('displayCart', cartSection)
                })
            }
        })
        
    }

    slideSideNav(active, nav, btn) {
        if(btn) {
            if(btn.classList.contains('close')){
                 nav.classList.remove(active);
                 document.body.classList.remove('transparentBg')
            }
        }
        nav.classList.add(active);
        document.body.classList.add('transparentBg')
    }

    updateCartValue = (cart) =>  {
        let overallBill = 0;
        let itemsTotal = 0;
        cart.map(item => {
            overallBill += item.price * item.qty;
            itemsTotal += item.qty;
        });
        let cartTotal= document.querySelector('#total-amount');
        cartTotal.textContent = `Total: $${parseFloat(overallBill.toFixed(2))}`;
        document.querySelectorAll('#itemCounter').forEach(el => {
            el.textContent = itemsTotal;
        });
    };

    setUpAPP() {
        cart = LocalStorage.getCart();
        this.updateCartValue(cart);
        cart.forEach(item => {
            displayCartItems.appendChild(this.cartItemTemplate(item));
        })
    }

    cartLogic(){
        clearCartBtn.addEventListener("click", ()=> this.clearCart());

        //Cart Functionalities

        displayCartItems.addEventListener("click", event => {
            const target = event.target;
            if(target.classList.contains('remove-item')) {
                const cartItem = target.parentElement.parentElement;
                const id = target.parentElement.dataset.id;
                displayCartItems.removeChild(cartItem);
                this.removeItem(id);
            }else if(target.classList.contains('fa-plus')) {
                
            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        console.log(cartItems);
        cartItems = cartItems.forEach(id => this.removeItem(id));
        while(displayCartItems.children.length > 0) {
            displayCartItems.removeChild(displayCartItems.children[0])
        }
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.updateCartValue(cart);
        LocalStorage.saveCart(cart);
        let btn = this.restoreCartBtn(id);
        btn.disabled = false;
        console.log(btn.disabled);
    }

    restoreCartBtn(id) {
        const cartBtns = [...document.querySelectorAll('.cartBtn')];
        return cartBtns.find(btn => btn.dataset.id === id);
    }
   
    
   
}


class LocalStorage {
    static products(items) {
        localStorage.setItem("Products", JSON.stringify(items))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("Products"));
        return (
            UI.findProduct(products, id)
        )
    }

    static saveCart(cart) {
        localStorage.setItem('Cart', JSON.stringify(cart))
    }

    static getCart() {
        return localStorage.getItem("Cart") ? (
             JSON.parse(localStorage.getItem("Cart"))) : []
    }
}


document.addEventListener('DOMContentLoaded', ()=> {
    const ui = new UI;
    const fetchData = new FetchData;
    //Get all products
    fetchData.getProducts()
    .then(products => {
            ui.displayProducts(products);
            LocalStorage.products(products);
        })
    .then(()=> {
        ui.uiCanInteract()
    })

});

function toggle() {
    var humburger = document.getElementById('navlinks');
    if (humburger.style.display === 'block') {
        humburger.style.display = 'none';
    }
    else {
        humburger.style.display = 'block';
    }
}

