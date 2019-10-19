
"use strict";
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
                const categories = [...product.categories];
                const {productName, price, id, moreDetails } = product;
                const {thumbnail, others} = product.images
                return {id, categories, thumbnail, others, productName, price, moreDetails}
            });
            console.log(products);
            return products
        } catch (error) {
            console.log(error)
        }
    }

    saveProducts = (products)=> products
}

class UI extends FetchData {

    displayProducts(products) {
        products = products.map(product => {
            const {id, thumbnail, productName, price} = product;
            return {id, thumbnail, productName, price}
        });
        let productsDOM = document.querySelector('.shop_menu');
        products.forEach(product => {
            productsDOM.innerHTML += this.productTemplate(product);
        });
    }

    productTemplate( product ) {
        let result = '';
        const {id, thumbnail, productName, price} = product;
        result += `
        <article class="shop_item" data-id="${id}">
            <div class="product-image">
                <img id="thumbnail" src="${thumbnail}" alt="">
                
                <div class="product-nav-btns">
                    <i class="fas fa-shopping-cart cartBtn" data-id = ${id}></i></i>
                    <i class="fas fa-expand-arrows-alt expand" data-id = ${id}></i>
                </div>
            </div>
            <div class="product-info">
                <a href="#"><h4 class="product-name">${productName}</h4></a>
                <h5 class="price">$${price}</h5>
            </div>
        </article>
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

    singleProductDOM() {
        let result = `
            <div class="product--description">

            </div>
        `
    }

    static findProduct(products, id) {
        const product = products.find(product => product.id === id);
        return product
    }

    addToCart() {
        const cartBtns = [...document.querySelectorAll('.cartBtn')];
        cartBtns.forEach(btn => {
            const id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            console.log(inCart)
            if(inCart){
                btn.disabled = true;
                return
            }
            
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
                return
            }
            // for quantity modification
            const itemNode = target.parentElement.parentElement;
            let itemQty = itemNode.querySelector('.value');
            const itemId = itemNode.dataset.id;
            let item = cart.find(item => item.id === itemId);
            if(target.classList.contains('fa-plus')) {
                item.qty++;
                itemQty.textContent = item.qty;
                LocalStorage.saveCart(cart);
                this.updateCartValue(cart);
            }else if(target.classList.contains('fa-minus')) {
                item.qty--
                if(item.qty === 0) {
                    displayCartItems.removeChild(itemNode.parentElement)
                }
                itemQty.textContent = item.qty;
                LocalStorage.saveCart(cart);
                this.updateCartValue(cart);
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
   
    
    display_a_product(product, container) {
        console.log(product);
        // const product = products.find(product => product.id === event.target.dataset.id);
        const {id, categories, productName, textContent, price} = product;
        const {thumbnail, others} = product;
        const images = [thumbnail, ...others]
        const {description} = product.moreDetails;
        const sideImgDiv = document.createElement('div');
        const viewAreaDiv = document.createElement('div');
        const viewAreaImg = document.createElement('img');
        const productImgcontainer = `
        <div class="product-photos page--section">
        `;
        container.innerHTML = productImgcontainer;
        sideImgDiv.classList.add('other-images');
        images.map((url, index) => {
            sideImgDiv.innerHTML += `
            <div class="container">
                <img src="${url}" alt="image ${index + 1} of product">
            </div>
            `
        });

     
        viewAreaDiv.classList.add('viewArea');

        viewAreaImg.src = images[0];
        viewAreaDiv.appendChild(viewAreaImg);
        container.querySelector('.product-photos').appendChild(sideImgDiv)
        container.querySelector('.product-photos').appendChild(viewAreaDiv);

        document.querySelectorAll('.container > img').forEach(el => {
            el.addEventListener('click', ()=> {
                console.log(el)
                viewAreaImg.src = el.src;
                viewAreaImg.alt = el.alt;
            })
        });
    }

    modalDisplay(modal, event) {
        const target = event.target;
        console.log(target);
        if(target.classList.contains('close')) {
            modal.classList.remove('active');
            modal.nextElementSibling.style.opacity = '1';
            return
        }
        modal.nextElementSibling.style.opacity = '.4';
        modal.classList.add('active');
    }


    uiCanInteract() {
        const toggleCart = document.querySelectorAll('.toggle-cart');
        toggleCart.forEach(el => el.addEventListener("click", ()=> {
            this.slideSideNav('displayCart', cartSection, el);
        }));
        this.setUpAPP();
        this.addToCart();
        this.cartLogic();
        const modalBox = document.querySelector('.modal--box');
        const container = modalBox.querySelector('.content-wrapper')
        const displayItemBtn = [...document.querySelectorAll('.expand')];
        displayItemBtn.forEach(btn => {
            btn.addEventListener('click', event =>  {
                this.modalDisplay(modalBox, event);
                const id = btn.dataset.id;
                console.log(id);
                const item = LocalStorage.getProduct(id);
                console.log(item);
                // this.display_a_product(item, container);
            })
        });
        modalBox.querySelector('.close').addEventListener('click', event => {
            this.modalDisplay(modalBox, event)
        });

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


    window.addEventListener('click', (close)=> {
        if(close.target == modal) {
            modal.style.display = 'none';
        }
        else if(close.target == cartContainer) {
            cartContainer.style.display = 'none';
        }
    })



function toggle() {
    const humburger = document.getElementById('navlinks');
    if (humburger.style.display === 'block') {
        humburger.style.display = 'none';
    }
    else {
        humburger.style.display = 'block';
    }
}

