/* =========================================================
   QR CODE PREVIEW — initialized BEFORE the rest of the app
   so a runtime error elsewhere cannot prevent QR clicking.
   ========================================================= */
(function () {
    const css = document.createElement("style");
    css.textContent = `
        .qr-clickable {
            cursor: zoom-in !important;
            pointer-events: auto !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: rgba(234,216,125,.25);
        }
        .qr-preview-overlay {
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            background: rgba(0,0,0,.88) !important;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity .18s ease, visibility .18s ease;
        }
        .qr-preview-overlay.is-open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }
        .qr-preview-box {
            position: relative !important;
            width: min(92vw, 500px) !important;
            padding: 22px !important;
            box-sizing: border-box !important;
            border: 1px solid #ead87d !important;
            border-radius: 18px !important;
            background: #17181c !important;
            box-shadow: 0 24px 80px rgba(0,0,0,.65) !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }
        .qr-preview-title {
            width: 80%;
            margin: 0 42px 14px 0;
            color: #fff;
            font-size: 17px;
            font-weight: 700;
        }
        .qr-preview-image {
            display: block !important;
            width: min(78vw, 420px) !important;
            height: min(78vw, 420px) !important;
            max-width: 76vh !important;
            max-height: 76vh !important;
            padding: 10px !important;
            box-sizing: border-box !important;
            object-fit: contain !important;
            background: #fff !important;
            border-radius: 8px !important;
        }
        .qr-preview-close {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            width: 38px !important;
            height: 38px !important;
            border: 1px solid #48505d !important;
            border-radius: 50% !important;
            background: #202228 !important;
            color: #fff !important;
            font-size: 24px !important;
            line-height: 1 !important;
            cursor: pointer !important;
        }
        .qr-preview-hint {
            margin-top: 12px;
            color: #cbd1dc;
            font-size: 12px;
            text-align: center;
        }
        body.qr-preview-open { overflow: hidden !important; }
        @media (max-width: 600px) {
            .qr-preview-overlay { padding: 12px !important; }
            .qr-preview-box { width: 94vw !important; padding: 16px !important; }
            .qr-preview-image {
                width: min(84vw, 380px) !important;
                height: min(84vw, 380px) !important;
                max-width: 78vh !important;
                max-height: 78vh !important;
                padding: 8px !important;
            }
            .qr-preview-title { font-size: 16px; margin-bottom: 10px; }
        }
    `;
    document.head.appendChild(css);

    let overlay = null;
    let preview = null;
    let previousFocus = null;

    function ensurePopup() {
        if (overlay && document.body.contains(overlay)) return;
        overlay = document.createElement("div");
        overlay.className = "qr-preview-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.innerHTML = `
            <div class="qr-preview-box" role="dialog" aria-modal="true" aria-label="QR code preview">
                <button type="button" class="qr-preview-close" aria-label="Close QR code preview">×</button>
                <div class="qr-preview-title">Scan QR Code</div>
                <img class="qr-preview-image" alt="Enlarged payment QR code">
                <div class="qr-preview-hint">Use your banking app to scan this QR code</div>
            </div>`;
        document.body.appendChild(overlay);
        preview = overlay.querySelector(".qr-preview-image");
        overlay.querySelector(".qr-preview-close").addEventListener("click", function (e) {
            e.stopPropagation();
            close();
        });
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) close();
        });
    }

    window.openPaymentQr = function (image) {
        if (!image) return;
        ensurePopup();
        const src = image.currentSrc || image.src || image.getAttribute("src");
        if (!src) return;
        previousFocus = document.activeElement;
        preview.src = src;
        preview.alt = image.alt || "Enlarged payment QR code";
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("qr-preview-open");
        setTimeout(function () {
            const closeButton = overlay.querySelector(".qr-preview-close");
            if (closeButton) closeButton.focus();
        }, 0);
    };

    window.closePaymentQr = close;

    function close() {
        if (!overlay) return;
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("qr-preview-open");
        setTimeout(function () {
            if (overlay && !overlay.classList.contains("is-open") && preview) preview.removeAttribute("src");
        }, 180);
        if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) close();
    });
})();

const methods = {
    online: { label: "Online Transfer", channels: ["vaderpay","vaderpayc2","payessence","bigpayz", "sklpay", "payjom"] },
    qr: { label: "DuitNow QR", channels: ["vaderpayc1", "vaderpayc2", "eziepayqr"] },
    bank: { label: "Bank In Transfer", channels: ["banktransfer"] },
    wallet: {
        label: "E-Wallet",
        channels: [
            "vaderpayc1",
            "a9wallet",
            "payessence",
            "payjom",
            "bigpayz",
            "eziepay"
        ],
    },
    crypto: { label: "Crypto", channels: ["usdt", "terracoin"] },
};
const channels = {
    vaderpay: {
        name: "VADERPAY",
        mark: "VP",
        logo: "assets/vaderpay.png",
        type: "E-Wallet",
        time: "Instant",
        min: 30,
        max: 10000,
        featured: true,
        fee: "Free",
    },
    vaderpayc1: {
        name: "VADERPAY (C1)",
        mark: "VP",
        logo: "assets/vaderpay.png",
        type: "DuitNow QR",
        time: "Instant",
        min: 30,
        max: 10000,
        fee: "Free",
    },
    vaderpayc2: {
        name: "VADERPAY (C2)",
        mark: "VP",
        logo: "assets/vaderpay.png",
        type: "DuitNow QR",
        time: "Instant",
        min: 10,
        max: 10000,
        fee: "Free",
    },
    payessence: {
        name: "PAY ESSENCE",
        mark: "PE",
        logo: "assets/payEssence.svg",
        type: "Online Transfer",
        time: "Instant–5 mins",
        min: 10,
        max: 30000,
        featured: true,
        fee: "Free",
    },
    help2pay: {
        name: "HELP2Pay",
        mark: "H2",
        logo: "assets/helppay2.svg",
        type: "Online Transfer",
        time: "Under maintenance",
        min: 10,
        max: 10000,
        disabled: true,
        fee: "Free",
    },
    a9wallet: {
        name: "A9Wallet",
        mark: "A9",
        logo: "assets/a9-03.svg",
        type: "E-Wallet",
        time: "Instant",
        min: 20,
        max: 10000,
        featured: true,
        fee: "Free",
    },
    touchngo: {
        name: "Touch ’n Go",
        mark: "TNG",
        logo: "assets/touchNgo.svg",
        type: "E-Wallet",
        time: "Instant",
        min: 20,
        max: 10000,
        featured: true,
        fee: "Free",
    },
    payjom: {
        name: "PayJom",
        mark: "payjom",
        logo: "assets/payjom.svg",
        type: "E-Wallet",
        time: "Instant",
        min: 20,
        max: 15000,
        fee: "Free",
    },
    bigpayz: {
        name: "BigPayz",
        mark: "bigpayz",
        logo: "assets/bigpayz.svg",
        type: "E-Wallet",
        time: "1–5 mins",
        min: 20,
        max: 10000,
        fee: "Free",
    },
    eziepay: {
        name: "EeziePay",
        mark: "EZ",
        logo: "assets/eeziepay.svg",
        type: "E-Wallet",
        time: "Instant",
        min: 40,
        max: 500,
        fee: "Free",
    },
    eziepayqr: {
        name: "EeziePay",
        mark: "EZ",
        logo: "assets/eeziepay.svg",
        type: "DuitNow QR",
        time: "Instant",
        min: 40,
        max: 500,
        fee: "Free",
    },
    banktransfer: {
        name: "Local Bank Transfer",
        mark: "BT",
        type: "Bank Transfer",
        time: "Review in 5–15 mins",
        min: 20,
        max: 30000,
        fee: "Free",
    },
    usdt: {
        name: "VADERPAY (C2)",
        mark: "VP",
        logo: "assets/vaderpay.png",
        type: "Crypto",
        time: "After on-chain confirmation",
        min: 5,
        max: 50000,
        fee: "Network fee",
    },
    terracoin: {
        name: "TERRACOIN",
        mark: "TC",
        type: "Crypto",
        time: "After on-chain confirmation",
        min: 5,
        max: 50000,
        fee: "Network fee",
    },
    sklpay: {
        name: "SKLPAY",
        mark: "SKL",
        logo: "",
        type: "Online Transfer",
        time: "",
        min: 50,
        max: 10000,
        featured: true,
        fee: "Free",
    },
    paymentA: { name: "PaymentA", mark: "A", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
    paymentB: { name: "PaymentB", mark: "B", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
    paymentC: { name: "PaymentA", mark: "A", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
    paymentD: { name: "PaymentB", mark: "B", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
    paymentE: { name: "PaymentA", mark: "A", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
    paymentF: { name: "PaymentB", mark: "B", type: "E-Wallet", time: "Instant", min: 40, max: 500, fee: "Free" },
};
const onlineBankOptions = [
    "Affin Bank",
    "AmBank",
    "Bank Simpanan Nasional",
    "Hong Leong Bank",
    "Maybank",
    "Public Bank Berhad",
    "RHB Bank",
    "CIMB Bank",
    "Bank Islam",
    "Bank Rakyat",
    "Alliance Bank",
    "OCBC Bank",
    "UOB Bank",
];
const depositPackages = [
    "Please Select",
    "No Bonus",
    "2% Unlimited Reload Bonus (Free Spin)",
    "Unlimited Casino Bonus 15% (MYR)",
    "10% Unlimited Slot Reload Bonus (MYR)",
    "10% Daily Deposit Bonus-Lottery Only",
];

const packageAmounts = {
    "No Bonus": "",
    "2% Unlimited Reload Bonus (Free Spin)": "MYR 50+",
    "Unlimited Casino Bonus 15% (MYR)": "MYR 100+",
    "10% Unlimited Slot Reload Bonus (MYR)": "MYR 50+",
    "10% Daily Deposit Bonus-Lottery Only": "MYR 30+",
};
const bankTransferOptions = [
    "Maybank",
    "Alliance Bank",
    "Public Bank"
];
const bankAccount = { name: "JH AUTO MOBILE", number: "560102718204" };
let ewalletChannelPage = 0;
const EWALLET_CHANNELS_PER_PAGE = 4;
let state = {
    method: "online",
    channel: "",
    channelSelected: false,
    extraChannel: "",
    senderAccountName: "",
    filter: "all",
    amount: "",
    bank: "",
    package: "",
    cryptoNetwork: "",
    walletPayment: "",
    promoCode: "",
    promoCodeStatus: "",
};
const $ = (s) => document.querySelector(s);
function money(n) {
    return `MYR ${Number(n).toLocaleString("en-MY")}`;
}
function render(){
    renderTabs();
    renderChannels();
    renderSummary();
    renderForm();
}

function renderTabs() {
    const methodIcons = {
        online: "assets/icn-deposit-onlinetransfer.svg",
        qr: "assets/duitNow_method.svg",
        bank: "assets/icn-deposit-bankin.svg",
        wallet: "assets/icn-deposit-eWallet.svg",
        crypto: "assets/icn-deposit-crypto.svg",
    };

    const methodDetails = {
        online: "Quick Pay",
        qr: "QR Pay",
        bank: "Manual Transfer",
        wallet: "Instant Payment",
        crypto: "USDT & more",
    };

    const tabs = $("#categoryTabs");
    if (!tabs) return;

    // Keep the ORIGINAL payment-method cards.
    // The selected method's detail is rendered INSIDE that same card.
    // No second card and no separate detail row are created.
    tabs.innerHTML = Object.entries(methods)
        .map(([id, m]) => {
            const selected = state.method === id;
            return `
                <button type="button" class="category-tab ${selected ? "active" : ""}" onclick="setMethod('${id}')">
                    <img src="${methodIcons[id]}" class="category-tab-icon" alt="">
                    <span class="category-tab-name">${m.label}</span>
                    ${selected ? `<span class="category-tab-detail">${methodDetails[id]}</span>` : ""}
                </button>`;
        })
        .join("");

    // Safety cleanup for older versions that may have left a detail row behind.
    const oldDetails = $("#paymentMethodDetails");
    if (oldDetails) oldDetails.remove();
    initMethodCarouselDrag();
}


function initMethodCarouselDrag() {
    const tabs = $("#categoryTabs");
    if (!tabs || tabs.dataset.dragReady === "1") return;
    tabs.dataset.dragReady = "1";

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    tabs.addEventListener("pointerdown", (e) => {
        if (window.matchMedia("(max-width: 900px)").matches === false && window.matchMedia("(pointer: coarse)").matches === false) return;
        isDown = true;
        moved = false;
        startX = e.clientX;
        startScroll = tabs.scrollLeft;
        tabs.setPointerCapture?.(e.pointerId);
    });

    tabs.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        if (moved) tabs.scrollLeft = startScroll - dx;
    });

    tabs.addEventListener("pointerup", () => {
        isDown = false;
    });

    tabs.addEventListener("pointercancel", () => {
        isDown = false;
    });
}

function changeDepositPackage() {
    state.package = "";
    renderChannels();
}

function movePackageBelowPaymentChannel() {
    const packageArea = $("#packageArea");
    const channelGrid = $("#channelGrid");
    const bankArea = $("#bankArea");

    if (!packageArea || !channelGrid) return;

    // MOBILE ONLY
    // Do not move Package to Payment Channel first,
    // because that causes the flashing effect.
    if (window.matchMedia("(max-width: 768px)").matches) {

        setTimeout(() => {
            if (
                bankArea &&
                bankArea.innerHTML.trim() !== ""
            ) {
                bankArea.insertAdjacentElement(
                    "afterend",
                    packageArea
                );
            } else {
                channelGrid.insertAdjacentElement(
                    "afterend",
                    packageArea
                );
            }
        }, 0);

        return;
    }

    // DESKTOP ONLY
    // Keep original position.
    channelGrid.insertAdjacentElement("afterend", packageArea);
}

function renderChannels() {
    document
        .querySelectorAll(
            "#onlineBankSelection,.bank-selection,.accepts-payment,#cryptoNetworkSelection,#depositPackageSelection"
        )
        .forEach((el) => el.remove());
    const bankAreaReset = $("#bankArea");
    if (bankAreaReset) bankAreaReset.innerHTML = "";
    const packageSection=`
<div id="depositPackageSelection" class="deposit-bonus-selection">

    <div class="deposit-bonus-title">
        Select a Package
    </div>

    <div class="deposit-bonus-list">

        ${depositPackages
            .filter(p=>p!=="Please Select")
            .map((p,index)=>{

                const selected=state.package===p;

                let title=p;
                let subtitle="";

                if(p==="No Bonus"){
                    title="No Bonus";
                }
                const amount = packageAmounts[p] || "";

                return `
                <button
                    type="button"
                    class="deposit-bonus-card ${selected?"selected":""} ${state.package && !selected ? "mobile-package-hidden" : ""}"
                    onclick="chooseDepositPackage('${p}')"
                >
                    <span class="deposit-bonus-content">
                        <span class="deposit-bonus-name">
                            ${title}
                        </span>

                        ${
                            subtitle
                            ?`<span class="deposit-bonus-subtitle">
                                ${subtitle}
                            </span>`
                            :""
                        }
                    </span>

                    ${
                        amount
                        ?`<span class="deposit-bonus-amount">${amount}</span>`
                        :""
                    }
                </button>
                `;
            }).join("")}
    </div>

    ${state.package ? `<button type="button" class="change-package-btn" onclick="changeDepositPackage()">Change Package</button>` : ""}
</div>`;
       
    const packageArea = $("#packageArea");
    if (packageArea) packageArea.innerHTML = packageSection;

    // Apply the same order to all payment methods:
    // Payment Channel / Receiving Bank first, Package second.
    movePackageBelowPaymentChannel();

    if(state.method==="bank"){
        $("#channelTitle").textContent="Choose a receiving bank";
        $("#channelSubtitle").textContent="";
        $("#filterBtn").classList.add("hidden");
        $("#filterRow").classList.add("hidden");

        const bankArea = $("#bankArea");
        if (bankArea) bankArea.innerHTML = `

        ${state.bank?bankAccountDetails():""}
    `;

        $("#channelGrid").innerHTML = "";
        return;
    }
    $("#channelTitle").innerHTML = `Payment channel`;
    $("#filterBtn").classList.add("hidden");
    $("#filterRow").classList.add("hidden");
    const list = methods[state.method].channels.filter((id) => {
        let c = channels[id];

        return (
            state.filter === "all" ||
            (state.filter === "low" && c.min <= 20) ||
            (state.filter === "high" && c.max >= 10000)
        );
    });
    /* Same 3-column Payment Channel design for Online Transfer, DuitNow QR,
       E-Wallet and Crypto. Bank In Transfer returned above. */
    $("#channelGrid").classList.remove("ewallet-paged");

    const paymentChannelSection = `
<div id="paymentChannelSelection" class="payment-channel-selection">
    <div class="payment-channel-text-list">
        ${list.map(id => {
            const c = channels[id];
            return `
            <button
                type="button"   
                    class="payment-channel-text-item
                        ${state.channel === id ? "selected" : ""}
                        ${c.disabled ? "disabled maintenance" : ""}"
                        ${c.disabled ? "" : `onclick="choosePaymentChannel('${id}')"`}>
                ${c.name}
                ${c.disabled ? `
                    <img
                        src="assets/maintenance.svg"
                        class="maintenance-icon"
                        alt="Under Maintenance"
                    >
                <div class="maintenance-overlay"></div>
                    ` : ""}
            </button>
            `;
        }).join("")}
    </div>
</div>
`;
    // E-Wallet channel choices:
    // VADERPAY (C1) → FPX / DuitNow
    // EeziePay → Boost / GrabPay / Touch N Go / Shopee Pay
    const walletChannelOptions =
        (
            (state.method === "online" && state.channel === "vaderpayc2") ||
            (state.method === "qr" && state.channel === "vaderpayc2") ||
            (state.method === "crypto" && state.channel === "usdt")
        )
            ? ["Channel 1", "Channel 2", "Channel 3"]
            : state.method === "wallet" && state.channel === "vaderpayc1"
                ? ["FPX", "DuitNow"]
                : state.method === "wallet" && state.channel === "eziepay"
                    ? ["Boost", "GrabPay", "Touch N Go", "Shopee Pay"]
                    : [];

    const extraChannelLogoMap = {
        "FPX": { src: "assets/logo-horizonta-fpxx.svg", alt: "FPX" },
        "DuitNow": { src: "assets/logo-horizonta-duitnowx.svg", alt: "DuitNow" },
        "Boost": { src: "assets/logo-horizontal-boostx.svg", alt: "Boost" },
        "GrabPay": { src: "assets/logo-horizontal-grabpayx.svg", alt: "GrabPay" },
        "Touch N Go": { src: "assets/logo-horizontal-touchnGox.svg", alt: "Touch 'n Go" },
        "Shopee Pay": { src: "assets/logo-horizontal-shopeepayx.svg", alt: "ShopeePay" }
    };

    const extraChannelSection = walletChannelOptions.length ? `
        <div id="walletExtraSelection" class="extra-channel-selection">
            <div class="extra-channel-title">
                Choose Channel
            </div>
            <div class="extra-channel-grid">
                ${walletChannelOptions.map(channel => {
                    const logo = extraChannelLogoMap[channel];
                    return `
                    <button
                        type="button"
                        class="extra-channel-item ${state.extraChannel === channel ? "selected" : ""}"
                        onclick="chooseExtraChannel('${channel}')"
                        aria-label="${channel}"
                    >
                        ${logo
                            ? `<img src="${logo.src}" alt="${logo.alt}" class="extra-channel-logo">`
                            : `<span class="extra-channel-name">${channel}</span>`}
                    </button>
                    `;
                }).join("")}
            </div>
        </div>
    ` : "";

    $("#channelGrid").innerHTML = paymentChannelSection + extraChannelSection;

    if (state.method === "crypto") {

        const bankArea = $("#bankArea");

        // TERRACOIN: custom QR payment design only for Crypto -> TERRACOIN.
        if (state.channel === "terracoin") {
            const terracoinQrSection = `
                <div id="terracoinQrSection" class="terracoin-qr-section">
                    <div class="terracoin-payment-row">
                        <div class="terracoin-qr-card">
                            <img src="assets/QRcode.jpg" alt="TERRACOIN QR Code" class="terracoin-qr-image qr-clickable" role="button" tabindex="0" aria-label="Tap to enlarge QR code" onclick="event.stopPropagation();window.openPaymentQr(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();window.openPaymentQr(this)}">
                        </div>

                        <div class="terracoin-payment-details">
                            <div class="fixed-account-field terracoin-to-field">
                                <span>To</span>
                         <div class="account-value-box terracoin-to-box">

    <span class="terracoin-address-text">
        TQ3U1Zz3XX5AqKHzbMZkjJ4UZpQfKHLN2v
    </span>

    <button
        type="button"
        class="copy-icon"
        title="Copy"
        aria-label="Copy"
        onclick="copyText('TQ3U1Zz3XX5AqKHzbMZkjJ4UZpQfKHLN2v')"
    >
        <img src="assets/copy-icon.svg" alt="">
    </button>

</div>
                            </div>

                            <div class="terracoin-rate-row">
                                <span>Current exchange rate</span>
                                <b>TRC 1: MYR 2</b>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            if (bankArea) bankArea.innerHTML = terracoinQrSection;
            return;
        }

        // VADERPAY (C2): keep the existing crypto network selection.
        const cryptoNetworks = [
            {
                id: "TRC20-USDT",
                name: "TRC20-USDT",
                icon: "assets/tether.svg"
            },
            {
                id: "ERC20-USDT",
                name: "ERC20-USDT",
                icon: "assets/ethereum.svg"
            }
        ];

        const networkSection = `
        <div id="cryptoNetworkSelection" class="crypto-network-selection">

            <div class="crypto-network-title">
                Choose a crypto network
            </div>

            <div class="crypto-network-grid">

                ${cryptoNetworks.map(network => `
                    <button
                        type="button"
                        class="crypto-network-item ${
                            state.cryptoNetwork === network.id
                                ? "selected"
                                : ""
                }"
                        onclick="setCryptoNetwork('${network.id}')"
                    >

                        <img
                            src="${network.icon}"
                            alt="${network.name}"
                        >

                        <span>
                            ${network.name}
                        </span>

                    </button>
                `).join("")}

            </div>

        </div>
    `;

        if (bankArea) bankArea.innerHTML = networkSection;

        return;
    }
    if (
   (state.method === "online" && (state.channel === "vaderpay" || state.channel === "vaderpayc2" || state.channel === "bigpayz" || state.channel === "sklpay"))
) {
            const bankSection = `
                    <div id="onlineBankSelection" class="bank-selection">

                    <label class="form-label">
                        Choose a Bank
            </label>

        <div class="bank-grid bank-grid-carousel" id="bankGridCarousel">
            <div class="bank-pages">
                ${Array.from({ length: Math.ceil(onlineBankOptions.length / 6) }, (_, pageIndex) => `
                    <div class="bank-page" data-bank-page="${pageIndex}">
                        ${onlineBankOptions.slice(pageIndex * 6, pageIndex * 6 + 6).map(bank => `
                            <button
                                type="button"
                                class="bank-grid-item ${state.bank === bank ? "selected" : ""}"
                                onclick='chooseOnlineBank(${JSON.stringify(bank)})'
                            >
                                <img src="${getBankIcon(bank)}" alt="${bank}">
                                <span>${bank}</span>
                            </button>
                        `).join("")}
                    </div>
                `).join("")}
            </div>
        </div>
        ${Math.ceil(onlineBankOptions.length / 6) > 1 ? `
            <div class="bank-page-dots" id="bankPageDots" aria-hidden="true">
                ${Array.from({ length: Math.ceil(onlineBankOptions.length / 6) }, (_, i) => `<span class="bank-page-dot ${i === 0 ? "active" : ""}"></span>`).join("")}
            </div>
        ` : ""}
        </div>
    </div>
    `;

            const bankArea = $("#bankArea");
            if (bankArea) {
                bankArea.innerHTML = bankSection;
                initBankCarousel();
            }
        }
}
function getWalletPaymentIcon(key) {
    const icons = {
        duitNow: "assets/duitNow.svg",
        boost: "assets/boost.svg",
        grabpay: "assets/grabpay.svg",
        shopee: "assets/shopee.svg",
        touchNgo: "assets/touchNgo.svg",
    };
    return icons[key] || "";
}
function getWalletPaymentName(key) {
    const names = {
        duitNow: "DuitNow",
        boost: "Boost",
        grabpay: "GrabPay",
        shopee: "ShopeePay",
        touchNgo: "Touch ’n Go",
    };
    return names[key] || "";
}
function getBankIcon(bank) {
    const icons = {
        "Affin Bank": "assets/bank-afffin.svg",
        AmBank: "assets/bank-am.svg",
        "Bank Simpanan Nasional": "assets/bank-bsn.svg",
        "Hong Leong Bank": "assets/bank-HLB.svg",
        Maybank: "assets/bank-maybank.svg",
        "Public Bank Berhad": "assets/bank-Pb.svg",
        "Public Bank": "assets/bank-Pb.svg",
        "RHB Bank": "assets/bank-RHB.svg",
        "CIMB Bank": "assets/bank-am.svg",
        "Bank Islam": "assets/bank-islam.svg",
        "Bank Rakyat": "assets/bank-rakyat.svg",
        "Alliance Bank": "assets/bank-alliance.svg",
        "OCBC Bank": "assets/bank-ocbc.svg",
        "UOB Bank": "assets/bank-uob.svg",
    };
    return icons[bank] || "";
}
function togglePaymentChannelDropdown() {
    const dropdown = $("#paymentChannelDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}
function choosePaymentChannel(id){
    if(!channels[id]||channels[id].disabled)return;
    state.channel=id;
    state.channelSelected=true;
    state.extraChannel =
        (state.method === "online" && id === "vaderpayc2") ||
        (state.method === "qr" && id === "vaderpayc2") ||
        (state.method === "crypto" && id === "usdt") ||
        (state.method === "wallet" && (id === "vaderpayc1" || id === "eziepay"))
            ? state.extraChannel
            : "";
    state.amount="";
    if (state.method === "crypto") state.cryptoNetwork = "";
    if(state.method==="online")state.bank="";
    if(state.method==="wallet"||state.method==="qr")state.walletPayment="";
    const dropdown=$("#paymentChannelDropdown");
    if(dropdown)dropdown.classList.remove("show");
    renderChannels();
    renderForm();
    renderSummary();
}
function chooseExtraChannel(channel) {
    state.extraChannel = channel;
    renderChannels();
    renderSummary();
    renderForm();
    validate();
}

function toggleBankDropdown() {
    const dropdown = $("#bankDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}
function toggleDepositPackageDropdown() {
    const dropdown = $("#depositPackageDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}
function chooseDepositPackage(packageName){

    state.package=packageName;

    renderChannels();
    renderSummary();
    renderForm();

}
function chooseWalletPayment(key) {
    state.walletPayment = key;
    renderChannels();
    renderSummary();
    renderForm();
}
function chooseBank(bank){
    if(state.method!=="bank")return;
    state.bank=bank;
    state.channel="banktransfer";
    state.amount="";
    const dropdown=$("#receivingBankDropdown");
    if(dropdown)dropdown.classList.remove("show");
    renderChannels();
    renderSummary();
    renderForm();
    // Re-check validation after a bank is selected so any old
    // missing-bank highlight is removed immediately.
    validate();
}
let ewalletDragStartX = null;
let ewalletDragStartY = null;
let ewalletDragging = false;
function goEwalletChannelPage(page) {
    ewalletChannelPage = page;
    renderChannels();
}
function bindEwalletDrag() {
    const grid = $("#channelGrid");
    if (!grid || grid.dataset.dragBound === "1") return;
    grid.dataset.dragBound = "1";
    grid.addEventListener("pointerdown", (e) => {
        if (state.method !== "wallet") return;
        ewalletDragStartX = e.clientX;
        ewalletDragStartY = e.clientY;
        ewalletDragging = true;
        grid.setPointerCapture?.(e.pointerId);
    });
    grid.addEventListener("pointerup", (e) => {
        if (!ewalletDragging || ewalletDragStartX === null) return;
        const dx = e.clientX - ewalletDragStartX;
        const dy = e.clientY - ewalletDragStartY;
        ewalletDragging = false;
        ewalletDragStartX = null;
        ewalletDragStartY = null;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
        const list = methods.wallet.channels.filter((id) => {
            const c = channels[id];
            return (
                !c.disabled &&
                (state.filter === "all" ||
                    (state.filter === "low" && c.min <= 20) ||
                    (state.filter === "high" && c.max >= 10000))
            );
        });
        const totalPages = Math.max(1, Math.ceil(list.length / EWALLET_CHANNELS_PER_PAGE));
        const nextPage = dx < 0 ? ewalletChannelPage + 1 : ewalletChannelPage - 1;
        if (nextPage >= 0 && nextPage < totalPages) goEwalletChannelPage(nextPage);
    });
    grid.addEventListener("pointercancel", () => {
        ewalletDragging = false;
        ewalletDragStartX = null;
        ewalletDragStartY = null;
    });
}
function chooseOnlineBank(bank) {
    // Keep the existing bank cards and current carousel page.
    // Selecting a bank must immediately remove the old "missing bank"
    // validation highlight. Other missing sections are recalculated normally.
    const wasAttempted = document.body.dataset.validationAttempted === "true";

    state.bank = bank;

    const carousel = document.getElementById("bankGridCarousel");
    if (carousel) {
        carousel.querySelectorAll(".bank-grid-item").forEach(item => {
            const label = item.querySelector("span");
            const isSelected = label && label.textContent.trim() === bank;
            item.classList.toggle("selected", isSelected);
            item.setAttribute("aria-selected", isSelected ? "true" : "false");
        });
    }

    // The previous validation class belongs to the old state.
    // Clear it BEFORE renderForm() replaces the validation/Pay To DOM.
    clearValidationHighlights();

    // Keep the current carousel page/scroll position exactly where it is.
    // Only refresh the dependent form/summary content.
    renderSummary();
    renderForm();

    // Preserve the player's validation attempt after the form is re-rendered.
    if (wasAttempted) {
        document.body.dataset.validationAttempted = "true";
    }

    validate();
}
function initBankCarousel() {
    const carousel = document.getElementById("bankGridCarousel");
    if (!carousel || carousel.dataset.bound === "1") return;
    carousel.dataset.bound = "1";

    const dots = Array.from(document.querySelectorAll("#bankPageDots .bank-page-dot"));

    const updateDots = () => {
        if (!dots.length) return;
        const pages = Array.from(carousel.querySelectorAll(".bank-page"));
        if (!pages.length) return;

        let activeIndex = 0;
        let smallestDistance = Infinity;

        pages.forEach((page, index) => {
            const distance = Math.abs(page.offsetLeft - carousel.scrollLeft);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                activeIndex = index;
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === activeIndex);
        });
    };

    carousel.addEventListener("scroll", updateDots, { passive: true });
    updateDots();

    /*
       IMPORTANT:
       Bank cards must remain normal clickable buttons on desktop.
       The old drag handler captured the mouse pointer on the whole
       carousel, which could prevent the button click from reaching
       chooseOnlineBank() in desktop browsers.

       Drag-to-swipe is therefore enabled ONLY on touch/mobile.
       Desktop uses normal button clicks.
    */
    if (window.matchMedia("(max-width: 768px)").matches) {
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let moved = false;

        carousel.addEventListener("pointerdown", e => {
            if (e.pointerType !== "touch") return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            startScroll = carousel.scrollLeft;
        });

        carousel.addEventListener("pointermove", e => {
            if (!dragging || e.pointerType !== "touch") return;
            const dx = e.clientX - startX;

            if (Math.abs(dx) > 6) moved = true;
            if (moved) {
                carousel.scrollLeft = startScroll - dx;
                e.preventDefault();
            }
        }, { passive: false });

        const stopDrag = () => {
            if (!dragging) return;
            dragging = false;
            carousel.scrollTo({
                left: Math.round(carousel.scrollLeft / carousel.clientWidth) * carousel.clientWidth,
                behavior: "smooth"
            });
        };

        carousel.addEventListener("pointerup", stopDrag);
        carousel.addEventListener("pointercancel", stopDrag);
    }
}
function bankAccountDetails() {
    const receivingBank = state.bank || "Alliance";
    const showQR = receivingBank === "Public Bank";

    return `<div class="bank-card">
        <h3>Pay To</h3>

        <div class="bank-payment-content">
            ${showQR ? `
            <div class="bank-payment-qr">
                <img src="assets/QRcode.jpg" alt="Public Bank Payment QR Code" class="qr-clickable" role="button" tabindex="0" aria-label="Tap to enlarge QR code" onclick="event.stopPropagation();window.openPaymentQr(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();window.openPaymentQr(this)}">
            </div>
            ` : ""}

            <div class="bank-payment-details">
                <div class="fixed-account-field">
                    <span>From</span>
                    <input
                        class="account-value-box account-value-input"
                        type="text"
                        value="${state.senderAccountName || ""}"
                        placeholder="Full name"
                        oninput="state.senderAccountName=this.value; validate()"
                        autocomplete="off"
                    >
                </div>

                <div class="fixed-account-field">
                    <span>To</span>
                    <div class="account-value-box">
                        <b>${receivingBank}</b>
                    </div>
                </div>

                <div class="fixed-account-field">
                    <span>Account Name</span>
                    <div class="account-value-box">
                        <b>${bankAccount.name}</b>
                        <button class="copy-icon" title="Copy Account Name" aria-label="Copy Account Name" onclick="copyText('${bankAccount.name}')">
                            <img src="assets/copy-icon.svg" alt="">
                        </button>
                    </div>
                </div>

                <div class="fixed-account-field">
                    <span>Account Number</span>
                    <div class="account-value-box">
                        <b>${bankAccount.number}</b>
                        <button class="copy-icon" title="Copy Account Number" aria-label="Copy Account Number" onclick="copyText('${bankAccount.number}')">
                            <img src="assets/copy-icon.svg" alt="">
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
function setCryptoNetwork(network) {
    state.cryptoNetwork = network;
    renderChannels();
    renderSummary();
    renderForm();
}
function renderSummary() {
    if (state.method === "bank") {

        $("#channelTitle").innerHTML =
       `Choose a receiving bank`;

        $("#filterBtn").classList.add("hidden");
        $("#filterRow").classList.add("hidden");

        $("#channelGrid").innerHTML = `
        <div class="bank-selector">
            <div class="bank-option-tabs">

                ${bankTransferOptions.map(bank => `
                    <button
                        type="button"
                        class="bank-tile ${
                            state.bank === bank
                                ? "selected"
                                : ""
                }"
                        onclick="chooseBank('${bank}')"
                    >

                        <img
                            src="${getBankIcon(bank)}"
                            alt="${bank}"
                        >

                        <span>${bank.toUpperCase()}</span>

                    </button>
                `).join("")}

            </div>

            <p class="bank-helper">
                Select the bank you will use for this transfer.
            </p>
        </div>
    `;

        return;
    }
    let c = channels[state.channel],
        logo = c.logo ? `<img src="${c.logo}" alt="${c.name}logo">` : c.mark;
    $("#providerSummary").classList.add("hidden");
    let methodLine = "";
    if (state.method === "online" && state.bank)
        methodLine = `<p class="provider-method"><img src="${getBankIcon(state.bank)}" alt="${state.bank}" class="summary-bank-icon"><span>${state.bank}</span></p>`;
    else if (
        (state.method === "wallet" || state.method === "qr") &&
        (state.channel === "vaderpayc1" || state.channel === "vaderpayc2" || state.channel === "eziepay")
    )
        methodLine = `<p class="provider-method"><img src="${getWalletPaymentIcon(state.walletPayment)}" alt="${getWalletPaymentName(state.walletPayment)}" class="duitnow-summary-icon"><span>${getWalletPaymentName(state.walletPayment)}</span></p>`;
    else if (state.method === "crypto" && state.cryptoNetwork)
        methodLine = `<p class="provider-method"><img src="assets/${state.cryptoNetwork === "TRC20-USDT" ? "tether.svg" : "ethereum.svg"}" alt="${state.cryptoNetwork}" class="crypto-summary-icon"><span>${state.cryptoNetwork}</span></p>`;
    else if (state.channel === "vaderpayc1" || state.channel === "vaderpayc2")
        methodLine = `<p class="provider-method"><img src="assets/duitNow.svg" alt="DuitNow" class="duitnow-summary-icon"><span>DuitNow QR · Instant</span></p>`;
    $("#providerSummary").innerHTML =
        `<div class="large-logo ${c.logo ? "image-logo" : ""}">${logo}</div><div><h2>${c.name}</h2>${methodLine}</div>`;
}
function field(label, content) {
    return `<label class="form-label">${label}</label>${content}`;
}
function amountBlock(c) {
    return `${field(`Amount`, `<div class="amount-wrap"><span class="currency">MYR</span><input id="amount"inputmode="decimal"placeholder="0"value="${state.amount}"oninput="setAmount(this.value)"></div><div id="amountHelp"class="input-help">Per transaction: ${money(c.min)}–${money(c.max)}</div>`)}<div class="quick-amounts">${[20, 50, 100, 200, 500, 1000].map((v) => `<button onclick="quickAmount(${v})">MYR ${v}</button>`).join("")}</div>`;
}
function setPromoCode(value) {
    // Promo codes are entered by the player and handled by the backend.
    // The UI does not validate, check, or display valid/invalid status.
    state.promoCode = value;
}

function promoCodeBlock() {
    return `${field(
        "Promo Code",
        `<div class="promo-code-wrap">
            <input id="promoCode"
                class="promo-code-input"
                type="text"
                placeholder="Have an Exclusive Promo Code?"
                value="${state.promoCode}"
                oninput="setPromoCode(this.value)"
                autocomplete="off">
        </div>`
    )}`;
}

function renderForm() {
    let c = channels[state.channel],
        specific = "";
    if (state.channel === "banktransfer")
        specific = `${amountBlock(c)}${field("Transfer receipt (optional)", `<div class="upload-box"><div class="upload-info"><span>A receipt may help us process your request faster.</span><small>JPG, PNG, or PDF · Maximum 10MB</small></div><label>Select file<input type="file"onchange="showToast('Transfer receipt selected')"></label></div>`)}`;
   
    else {
        let warning =
            state.channel === "eziepay"
                ? `<div class="notice"><b>!</b><span>This channel has a ${money(500)} maximum per transaction. Choose another channel for a higher amount.</span></div>`
                : "";
        specific = `${warning}${amountBlock(c)}`;
    }
    const label =
        state.channel === "banktransfer"
            ? "Submit transfer request"
            : state.channel === "usdt"
              ? "Continue"
              : `Continue with ${c.name}`;
    $("#dynamicForm").innerHTML =
        `${specific}${promoCodeBlock()}<button id="submitBtn" type="button" class="primary-button" onclick="submitDeposit()">${label}</button>`;
    validate();
}
const paymentFormAlignmentStyle = document.createElement("style");
paymentFormAlignmentStyle.textContent =
    ".deposit-layout{align-items:start}.channel-area,.dynamic-form{}#channelGrid,#paymentChannelSelection{margin:0}#depositPackageSelection{margin-top:28px}";
document.head.appendChild(paymentFormAlignmentStyle);

const terracoinQrStyle = document.createElement("style");
terracoinQrStyle.textContent =
    ".terracoin-qr-section{width:100%;box-sizing:border-box;padding:18px 24px;background: linear-gradient(120deg, #1F1F1F, #111214);    border: 1px solid var(--line);    border-radius: var(--radius);    box-shadow: var(--shadow);    margin-bottom: 16px;}.terracoin-payment-row{display:flex;align-items:center;gap:24px;width:100%}.terracoin-qr-card{display:flex;justify-content:center;align-items:center;flex:0 0 auto}.terracoin-qr-image{margin: 0 auto;width:120px;height:120px;object-fit:contain;display:block;background:#fff;padding:6px;box-sizing:border-box}.terracoin-payment-details{flex:1;min-width:0}.terracoin-to-field{margin:0;display:flex;align-items:center;gap:8px}.terracoin-to-field>span{flex:0 0 auto;margin:0}.terracoin-to-box{flex:1;min-width:0;display:flex!important;align-items:center;gap:8px;padding-right:10px}.terracoin-to-box{display:flex!important;align-items:center;gap:8px;padding-right:10px}.terracoin-account-input{flex:1;min-width:0;border:1px solid #3a4352;border-radius:10px;background:#252932;color:#fff;font:inherit;font-weight:700;font-size:16px;padding:12px 14px;box-sizing:border-box;outline:none}.terracoin-account-input::placeholder{color:#fff;font-weight:400;opacity:.7}.terracoin-rate-row{margin-top:12px;display:flex;align-items:center;gap:10px;color:#c5ccd6;font-size:13px}.terracoin-rate-row b{display:inline-block;color:#fff;padding:8px 12px;font-size:13px}@media(max-width:700px){.terracoin-qr-section{padding:16px;background: linear-gradient(120deg, #1F1F1F, #111214);border: 1px solid var(--line);border-radius: var(--radius); box-shadow: var(--shadow);}.terracoin-payment-row{display:block;width:100%}.terracoin-qr-card{justify-content:flex-start;margin-bottom:16px}.terracoin-qr-image{width:92px;height:92px}.terracoin-payment-details{width:100%}.terracoin-to-box{width:100%;max-width:100%;min-width:0;display:flex!important;align-items:flex-start;padding-right:10px}.terracoin-account-input{flex:1;min-width:0;white-space:normal;overflow-wrap:anywhere;word-break:break-all}.terracoin-rate-row{flex-wrap:wrap}}";
document.head.appendChild(terracoinQrStyle);

const packageAmountStyle = document.createElement("style");
packageAmountStyle.textContent =
    "#depositPackageSelection .deposit-bonus-card{display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left}#depositPackageSelection .deposit-bonus-radio{display:none!important}#depositPackageSelection .deposit-bonus-content{display:flex;flex:1;min-width:0;flex-direction:column}#depositPackageSelection .deposit-bonus-name{display:block}#depositPackageSelection .deposit-bonus-amount{margin-left:auto;white-space:nowrap;font-weight:700;font-size:13px;color:#f3ead0}";
document.head.appendChild(packageAmountStyle);

const promoCodeStyle = document.createElement("style");
promoCodeStyle.textContent =
    ".promo-code-wrap{width:100%;margin-bottom:20px; margin-top: 10px;}.promo-code-input{width:100%;height:48px;padding:0 16px;border:1px solid #3a4352;border-radius:10px;background:linear-gradient(120deg, #1F1F1F, #111214);color:#fff;font:inherit;font-size:16px;box-sizing:border-box;outline:none}.promo-code-input::placeholder{color:#b7bec9}.promo-code-input:focus{border-color:var(--color-primary);box-shadow:0 0 0 2px rgba(255,214,75,.12)}";
document.head.appendChild(promoCodeStyle);


const payToFromStyle = document.createElement("style");
payToFromStyle.textContent =
    ".account-value-input{font:inherit;color:#fff;font-weight:700;outline:none;width:100%;box-sizing:border-box;min-height:44px;padding:0 14px;border:1px solid #3a4352;border-radius:10px;background:linear-gradient(120deg, #1F1F1F, #111214);;box-shadow:none}.account-value-input::placeholder{color:#7b8794;font-weight:400;opacity:1}";
document.head.appendChild(payToFromStyle);

const securityCopyStyle = document.createElement("style");
securityCopyStyle.textContent =
    ".security-copy{display:flex;align-items:center;gap:8px}.security-copy img{width:16px;height:16px;object-fit:contain;flex-shrink:0}";
document.head.appendChild(securityCopyStyle);
const depositPackageStyle = document.createElement("style");
depositPackageStyle.textContent = `.deposit-package-selection{}.deposit-package-wrap{position:relative;width:100%}.deposit-package-select{width:100%;height:44px;padding:0 14px;border:1px solid #b9d0ff;border-radius:6px;background:#fff;color:#10243f;display:flex;align-items:center;justify-content:space-between;font-size:16px;cursor:pointer;text-align:left;box-sizing:border-box}.package-placeholder{color:#777}.package-arrow{color:#627795;font-size:14px}.deposit-package-dropdown{position:absolute;top:calc(100% + 4px);bottom:auto;left:0;right:0;background:#fff;border:1px solid #d9e2ee;border-radius:6px;box-shadow:0 8px 24px rgba(20,50,90,.15);max-height:240px;overflow-y:auto;z-index:9999;display:none}.deposit-package-dropdown.show{display:block}.deposit-package-item{width:100%;min-height:44px;padding:10px 14px;border:0;background:#fff;color:#10243f;text-align:left;font-size:15px;cursor:pointer}.deposit-package-item:hover{background:#f1f6ff}`;
document.head.appendChild(depositPackageStyle);
function setMethod(id) {
    // Switching Deposit Method starts a fresh validation state.
    // Remove any red/neon highlight left by the previous method,
    // including the Amount section.
    clearValidationHighlights();

    document.body.dataset.validationAttempted = "false";

    state.method = id;
    state.filter = "all";
    if (id === "wallet") ewalletChannelPage = 0;
    if (id === "crypto") state.cryptoNetwork = "";
    let first = methods[id].channels.find((x) => !channels[x].disabled);
    state.channel = "";
    state.amount = "";
    if (id !== "online") state.bank = "";
    state.walletPayment = "";
    state.package = "";
    state.channelSelected = false;
    state.extraChannel = "";
    render();

    // The new payment method must not inherit validation highlights
    // from the previous payment method.
    clearValidationHighlights();

    document.body.dataset.validationAttempted = "false";
}
function selectChannel(id) {
    if (channels[id].disabled) {
        showToast("This channel is under maintenance. Please choose another method.");
        return;
    }
    state.channel = id;
    state.amount = "";
    if (state.method === "online") state.bank = "";
    if (state.method === "wallet" || state.method === "qr") state.walletPayment = "";
    render();
}
function setFilter(v) {
    state.filter = v;
    renderChannels();
}
function setAmount(v) {
    state.amount = v;
    validate();
    if (state.channel === "usdt")
        $("#usdtEstimate").textContent = `~ ${(Number(v || 0) * 0.2477).toFixed(4)} ${state.cryptoNetwork}`;
}
function quickAmount(v) {
    state.amount = v;
    let a = $("#amount");
    if (a) a.value = v;
    validate();
    if (state.channel === "usdt")
        $("#usdtEstimate").textContent = `~ ${(v * 0.2477).toFixed(4)} ${state.cryptoNetwork}`;
}
function validateDepositRequirements() {
    const errors = [];
    const amount = Number(state.amount);

    // All flows require a package.
    if (!state.package || state.package === "Please Select") {
        errors.push("Please select a package.");
    }

    // Online Transfer: Package + Payment Channel + Choose Bank + Amount
    if (state.method === "online") {
        if (!state.channelSelected || !state.channel) errors.push("Please select a payment channel.");
        if (state.channel === "vaderpayc2" && !state.extraChannel) {
            errors.push("Please choose a channel.");
        }
        if (!state.bank) errors.push("Please choose a bank.");
    }

    // DuitNow QR: Package + Payment Channel + Amount
    if (state.method === "qr") {
        if (!state.channelSelected || !state.channel) errors.push("Please select a payment channel.");
        if (state.channel === "vaderpayc2" && !state.extraChannel) {
            errors.push("Please choose a channel.");
        }
    }

    // Bank In Transfer: Package + Receiving Bank + Full Name + Amount
    if (state.method === "bank") {
        if (!state.bank) errors.push("Please choose a receiving bank.");
        if (!String(state.senderAccountName || "").trim()) {
            errors.push("Please enter your full name.");
        }
    }

    // E-Wallet: Package + Payment Channel + Amount
    if (state.method === "wallet") {
        if (!state.channelSelected || !state.channel) errors.push("Please select a payment channel.");
    }

    // Crypto: Package + Payment Channel + Amount.
    // Only VADERPAY (C2) requires a crypto network selection.
    if (state.method === "crypto") {
        if (!state.channelSelected || !state.channel) errors.push("Please select a payment channel.");
        if (state.channel === "usdt" && !state.extraChannel) {
            errors.push("Please choose a channel.");
        }
        if (state.channel === "usdt" && !state.cryptoNetwork) {
            errors.push("Please choose a crypto network.");
        }
    }

    if (!amount || amount <= 0) {
        errors.push("Please enter a deposit amount.");
    } else if (state.channel && channels[state.channel]) {
        const c = channels[state.channel];
        if (amount < c.min || amount > c.max) {
            errors.push(`Amount must be between ${money(c.min)} and ${money(c.max)}.`);
        }
    }

    return errors;
}

function validate() {
    const btn = $("#submitBtn");
    if (!btn) return;

    // Keep the Continue button clickable at all times.
    // Missing requirements are shown only after the player clicks Continue.
    btn.disabled = false;
    btn.removeAttribute("aria-disabled");

    const errors = validateDepositRequirements();

    // After Continue is pressed, keep only the relevant controls/cards
    // highlighted. No validation alert text is shown below the button.
    if (document.body.dataset.validationAttempted === "true") {
        applyValidationHighlights(errors);
    }
}

function getValidationTarget(error) {
    const text = String(error || "").toLowerCase();

    if (text.includes("package")) return "#depositPackageSelection";
    if (text.includes("payment channel")) return "#paymentChannelSelection";
    if (text.includes("receiving bank")) return "#channelGrid";
    if (text.includes("full name")) return "#bankArea";
    if (text.includes("choose a bank")) return "#bankArea";
    if (text.includes("choose a channel")) return "#walletExtraSelection";
    if (text.includes("crypto network")) return "#cryptoNetworkSelection";
    if (text.includes("deposit amount") || text.includes("amount must")) return "#amount";

    return "";
}

function clearValidationHighlights() {
    document.querySelectorAll(".validation-missing").forEach(el => {
        el.classList.remove("validation-missing");
    });

    // Never leave the outer payment form container highlighted.
    const dynamicForm = $("#dynamicForm");
    if (dynamicForm) dynamicForm.classList.remove("validation-missing");
}

function applyValidationHighlights(errors) {
    clearValidationHighlights();

    if (!errors || !errors.length) return;

    const seen = new Set();
    errors.forEach(error => {
        const selector = getValidationTarget(error);
        if (!selector || seen.has(selector)) return;
        seen.add(selector);

        // Package validation is applied to EACH package card rather than
        // the whole Select a Package container.
        if (selector === "#depositPackageSelection") {
            document.querySelectorAll("#depositPackageSelection .deposit-bonus-card").forEach(card => {
                card.classList.add("validation-missing");
            });
            return;
        }

        const target = $(selector);
        if (!target) return;

        // Amount is an input; highlight its visible wrapper instead.
        const highlightTarget = selector === "#amount"
            ? (target.closest(".amount-wrap") || target)
            : target;

        highlightTarget.classList.add("validation-missing");
    });
}

function focusFirstMissingSection(errors) {
    if (!errors || !errors.length) return;

    const selector = getValidationTarget(errors[0]);
    if (!selector) return;

    const target = $(selector);
    if (!target) return;

    const scrollTarget = selector === "#amount"
        ? (target.closest(".amount-wrap") || target)
        : target;

    // On mobile, guide the player directly to the first missing section.
    // Desktop keeps the full form visible and only highlights the section.
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            scrollTarget.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 80);
    }
}

function renderInlineValidation(errors) {
    // Validation feedback is visual only: highlight the exact missing
    // control(s), with every package card highlighted when no package
    // has been selected. No alert/list is displayed below Continue.
    document.body.dataset.validationAttempted = "true";
    applyValidationHighlights(errors);

    if (!errors || !errors.length) {
        document.body.dataset.validationAttempted = "false";
        clearValidationHighlights();
    }
}

function focusValidationSection(selector) {
    const target = $(selector);
    if (!target) return;

    const scrollTarget = selector === "#amount"
        ? (target.closest(".amount-wrap") || target)
        : target;

    scrollTarget.classList.add("validation-missing");
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
}

function depositReminderStyles() {
    if ($("#depositReminderStyle")) return;
    const s = document.createElement("style");
    s.id = "depositReminderStyle";
    s.textContent = `#depositReminderBackdrop{position:fixed;inset:0;background:rgba(9,24,44,.48);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;box-sizing:border-box}#depositReminderBox{width:min(440px,100%);background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(10,30,60,.22);padding:26px;box-sizing:border-box;font-family:inherit;color:#10243f}#depositReminderBox .dr-icon{width:42px;height:42px;border-radius:50%;background:#fff3d6;color:#b77900;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin-bottom:14px}#depositReminderBox h3{margin:0 0 8px;font-size:20px;color:#10243f}#depositReminderBox p{margin:0 0 18px;color:#627795;line-height:1.55;font-size:14px}#depositReminderBox .dr-selection{background:#f4f7fb;border:1px solid #e0e7f0;border-radius:10px;padding:10px 14px;margin-bottom:20px;font-weight:600;color:#10243f;display:flex;align-items:center;gap:10px;min-height:44px;box-sizing:border-box}#depositReminderBox .dr-payment-icon{width:30px;height:30px;object-fit:contain;flex:0 0 30px}#depositReminderBox .dr-actions{display:flex;gap:10px;justify-content:flex-end}#depositReminderBox button{min-height:44px;padding:0 18px;border-radius:9px;border:0;font-weight:700;cursor:pointer;font-size:14px}#depositReminderBox .dr-back{background:#eef2f7;color:#34506f}#depositReminderBox .dr-continue{background: var(--color-primary);color:#000}`;
    document.head.appendChild(s);
}
function showDepositReminder(title, message, selection, onContinue, actionLabel) {
    actionLabel = actionLabel || "Continue";
    depositReminderStyles();
    let old = $("#depositReminderBackdrop");
    if (old) old.remove();
    const el = document.createElement("div");
    el.id = "depositReminderBackdrop";
    el.innerHTML = `<div id="depositReminderBox" role="dialog" aria-modal="true" aria-labelledby="depositReminderTitle"><div class="dr-icon">!</div><h3 id="depositReminderTitle">${title}</h3><p>${message}</p>${selection ? `<div class="dr-selection">${selection === "DuitNow" ? `<img src="assets/duitNow.svg" alt="DuitNow" class="dr-payment-icon">` : selection === "Boost" ? `<img src="assets/boost.svg" alt="Boost" class="dr-payment-icon">` : selection === "GrabPay" ? `<img src="assets/grabpay.svg" alt="GrabPay" class="dr-payment-icon">` : selection === "ShopeePay" ? `<img src="assets/shopee.svg" alt="ShopeePay" class="dr-payment-icon">` : selection === "Touch ’n Go" ? `<img src="assets/touchNgo.svg" alt="Touch ’n Go" class="dr-payment-icon">` : selection === "TRC20-USDT" ? `<img src="assets/tether.svg" alt="TRC20-USDT" class="dr-payment-icon">` : selection === "ERC20-USDT" ? `<img src="assets/ethereum.svg" alt="ERC20-USDT" class="dr-payment-icon">` : ""}<span>${selection}</span></div>` : ""}<div class="dr-actions">${actionLabel === "Choose Bank" ? `<button type="button"class="dr-continue"style="width:100%"onclick="closeDepositReminder();toggleBankDropdown()">Choose Bank</button>` : `<button type="button"class="dr-back"onclick="closeDepositReminder()">Back</button><button type="button"class="dr-continue"onclick="closeDepositReminder();${onContinue}">${actionLabel}</button></>`}</div></div>`;
    document.body.appendChild(el);
    el.onclick = (e) => {
        if (e.target === el) closeDepositReminder();
    };
}
function closeDepositReminder() {
    let el = $("#depositReminderBackdrop");
    if (el) el.remove();
}
function processDeposit() {
    let btn = $("#submitBtn");
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Creating secure payment order…";
    setTimeout(() => {
        btn.disabled = false;
        openModal();
    }, 700);
}
function submitDeposit() {
    let btn = $("#submitBtn");
    const errors = validateDepositRequirements();

    // Show validation visually on the exact missing controls/cards only.
    // Do not display an alert/list underneath the Continue button.
    if (errors.length) {
        renderInlineValidation(errors);
        focusFirstMissingSection(errors);
        validate();
        return;
    }

    renderInlineValidation([]);

    if (!btn) return;
    if (state.method === "bank" && !state.bank) {
        showDepositReminder(
            "Choose a receiving bank",
            "Please select a receiving bank before continuing.",
            "Choose Maybank or Alliance Bank for this transfer.",
            "",
            "Choose Bank"
        );
        return;
    }
    if (state.method === "online" && !state.bank) {
        showDepositReminder(
            "Choose a bank",
            "Please select a bank before continuing.",
            "Choose a bank to receive the payment instruction.",
            "",
            "Choose Bank"
        );
        return;
    }
    if (state.method === "online") {
        const bank = String(state.bank || "").trim();
        const amount = String(state.amount || "").trim();
        if (!bank || !amount) return;
        sessionStorage.setItem("bankTransferFlow", JSON.stringify({ bank, amount }));
        window.location.assign(
            "Bank_transfer.html?state=1&bank=" + encodeURIComponent(bank) + "&amount=" + encodeURIComponent(amount)
        );
        return;
    }
    if (
        (state.method === "qr" || state.method === "wallet") &&
        (state.channel === "vaderpayc1" || state.channel === "vaderpayc2" || state.channel === "eziepay")
    ) {
        const name = getWalletPaymentName(state.walletPayment);
        showDepositReminder(
            "Check your payment method",
            "Please make sure you have selected your preferred payment method before continuing.",
            name,
            "window.location.href='DuitNowQR.html?amount=' + encodeURIComponent(state.amount)",
            "Continue to QR Payment"
        );
        return;
    }
    if (state.method === "crypto") {
        if (!state.cryptoNetwork) {
            showDepositReminder(
                "Choose a crypto network",
                "Please select TRC20-USDT or ERC20-USDT before continuing.",
                "Choose a crypto network",
                "",
                "Choose Network"
            );
            return;
        }
        showDepositReminder(
            "Check your crypto network",
            "Please confirm that the selected crypto network matches the network you will use to make the deposit.",
            state.cryptoNetwork,
            ""
        );
        return;
    }
    if (state.channel === "banktransfer") {
        showDepositReminder(
            "Check your transfer details",
            "Please review your bank transfer details and make sure you are paying to the correct account.",
            "Bank transfer details",
            ""
        );
        return;
    }
    processDeposit();
}
function openModal() {
    let c = channels[state.channel],
        isCrypto = state.channel === "usdt",
        isBank = state.channel === "banktransfer";
    let body = isBank
        ? `<h2>Transfer request submitted</h2><p>Please keep the order number. Your balance will update automatically when the review is complete.</p><div class="payment-detail"><span>Order number</span><b>DEP20260820-9821</b></div><div class="payment-detail"><span>Status</span><b class="countdown">Under review</b></div><div class="payment-detail"><span>Estimated processing time</span><b>5–15 minutes</b></div>`
        : isCrypto
          ? `<h2>USDT deposit address</h2><p>Send USDT to this address using the specified network.</p><div class="qr"></div><div class="payment-detail"><span>Network</span><b>${state.cryptoNetwork}</b></div><div class="payment-detail"><span>Wallet address</span><b>0x9F6a...81cD <button class="copy-button" onclick="copyText('0x9F6a3C8d1f88A3c4B7dE7A6f1F10b39881cD')">Copy</button></b></div><div class="network">Do not send assets other than USDT on the selected ${state.cryptoNetwork} network to this address. They may not be recoverable.</div>`
          : `<h2>Payment QR code generated</h2><p>Scan this QR code with a supported wallet to complete payment.</p><div class="qr"></div><div class="payment-detail"><span>Amount due</span><b>${money(state.amount)}</b></div><div class="payment-detail"><span>Order status</span><b class="countdown">Waiting for payment · 14:58</b></div><div class="payment-detail"><span>Order number</span><b>DEP20260820-9821</b></div>`;
    $("#modal").innerHTML =
        `${body}<div class="modal-actions"><button class="secondary-button" onclick="closeModal()">${isCrypto ? "Edit amount" : "Close"}</button><button class="primary-button" onclick="closeModal();showToast('${isBank ? "Request received. We will process it shortly." : "Checking payment status"}')">${isBank ? "Done" : "I have paid"}</button></div>`;
    $("#modalBackdrop").classList.remove("hidden");
}
function closeModal() {
    $("#modalBackdrop").classList.add("hidden");
}
function copyText(t) {
    navigator.clipboard?.writeText(t);
    showToast("Account details copied");
}
function showToast(t) {
    let el = $("#toast");
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}
const cryptoSummaryStyle = document.createElement("style");
cryptoSummaryStyle.textContent =
    ".crypto-summary-icon{width:24px;height:24px;object-fit:contain;vertical-align:middle;margin-right:8px}";
document.head.appendChild(cryptoSummaryStyle);
$("#modalBackdrop").onclick = (e) => {
    if (e.target.id === "modalBackdrop") closeModal();
};
function initDepositHelp() {
    if (document.getElementById("depositHelp")) return;
    const headings = [...document.querySelectorAll("h1,h2,h3")].filter((el) => el.textContent.trim() === "Deposit");
    const title = headings[0];
    if (!title) return;
    const wrap = document.createElement("span");
    wrap.className = "deposit-title-with-help";
    const icon = document.createElement("span");
    icon.id = "depositHelp";
    icon.className = "deposit-help";
    icon.setAttribute("aria-label", "Need for Help?");
    icon.innerHTML = `<img src="assets/help.svg" alt="Help"><span>Need for Help?</span>`;
    title.parentNode.insertBefore(wrap, title);
    wrap.appendChild(title);
    wrap.appendChild(icon);
}
const depositHelpStyle = document.createElement("style");
depositHelpStyle.textContent = `.deposit-title-with-help{display:inline-flex;align-items:center;gap:9px}.deposit-title-with-help h1,.deposit-title-with-help h2,.deposit-title-with-help h3{margin-right:0}.deposit-help{position:relative;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;cursor:help;vertical-align:middle}.deposit-help img{width:15px;height:15px;display:block;cursor: pointer;filter: brightness(0) invert(1);}.deposit-help>span{position:absolute;left:32px;top:50%;transform:translateY(-50%);background:#baab68;color:#000;padding:7px 11px;border-radius:6px;font-size:13px;font-weight:500;line-height:1.2;white-space:nowrap;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease;z-index:1000}.deposit-help:hover>span{opacity:1;visibility:visible}`;
document.head.appendChild(depositHelpStyle);

/* Bank In Transfer searchable dropdown */
const bankTransferDropdownStyle=document.createElement("style");
bankTransferDropdownStyle.textContent=`
.bank-selector{width:100%;box-sizing:border-box}
.bank-select-wrap{position:relative;width:100%}
.bank-select{width:100%;height:46px;border:1px solid #bfd0e5;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:16px;color:#23364d;cursor:pointer;text-align:left;box-sizing:border-box}
.bank-dropdown{display:none;position:absolute;left:0;top:calc(100% + 2px);width:100%;background:#fff;border:1px solid #c7d2df;border-radius:4px;z-index:9999;box-sizing:border-box;box-shadow:0 8px 20px rgba(16,36,63,.14);overflow:hidden}
.bank-dropdown.show{display:block}
#bankSearch{display:block;width:calc(100% - 8px);height:34px;margin:4px;padding:0 10px;border:2px solid #333;border-radius:3px;box-sizing:border-box;font-size:14px;outline:none}
#bankOptions{max-height:230px;overflow-y:auto}
.bank-option{display:block;width:100%;min-height:42px;padding:10px 12px;border:0;background:#fff;color:#2c3540;text-align:left;font-size:14px;cursor:pointer;box-sizing:border-box}
.bank-option:hover,.bank-option.selected{background:#2d68bd;color:#fff}
`;
document.head.appendChild(bankTransferDropdownStyle);

initDepositHelp();
render();


/*close it when clicking blank space*/
document.addEventListener("click",function(e){

const packageDropdown=$("#depositPackageDropdown");
const packageWrap=e.target.closest(".deposit-package-wrap");

if(packageDropdown&&!packageWrap){
packageDropdown.classList.remove("show");
}


const paymentDropdown=$("#paymentChannelDropdown");
const paymentWrap=e.target.closest(".payment-channel-wrap");

if(paymentDropdown&&!paymentWrap){
paymentDropdown.classList.remove("show");
}


const bankDropdown=$("#bankDropdown");
const bankWrap=e.target.closest(".bank-select-wrap");

if(bankDropdown&&!bankWrap){
bankDropdown.classList.remove("show");
}
const receivingBankDropdown=$("#receivingBankDropdown");
const receivingBankWrap=e.target.closest(".receiving-bank-select-wrap");
if(receivingBankDropdown&&!receivingBankWrap){
receivingBankDropdown.classList.remove("show");
}

const cryptoDropdown=$("#cryptoNetworkDropdown");
const cryptoWrap=e.target.closest(".crypto-network-wrap");

if(cryptoDropdown&&!cryptoWrap){
cryptoDropdown.style.display="none";
}

});



function toggleCryptoNetworkDropdown(){
const dropdown=$("#cryptoNetworkDropdown");
if(!dropdown)return;
dropdown.style.display=dropdown.style.display==="block"?"none":"block";
}

function closeCryptoNetworkDropdown(){
const dropdown=$("#cryptoNetworkDropdown");
if(dropdown)dropdown.style.display="none";
}


function toggleBankDropdown(e){
if(e)e.stopPropagation();
const dropdown=$("#bankDropdown");
if(!dropdown)return;
dropdown.classList.toggle("show");
if(dropdown.classList.contains("show")){
const search=$("#bankSearch");
if(search)setTimeout(()=>search.focus(),0);
}
}

function toggleReceivingBankDropdown(e){
if(e)e.stopPropagation();
const dropdown=$("#receivingBankDropdown");
if(!dropdown)return;
dropdown.classList.toggle("show");
if(dropdown.classList.contains("show")){
const search=$("#receivingBankSearch");
if(search)setTimeout(()=>search.focus(),0);
}
}
function filterReceivingBanks(value){
const keyword=value.toLowerCase().trim();

document.querySelectorAll(".receiving-bank-option").forEach(option=>{
option.style.display=option.textContent.toLowerCase().includes(keyword)?"block":"none";
});
}
const receivingBankDropdownStyle=document.createElement("style");
receivingBankDropdownStyle.textContent=`.receiving-bank-select-wrap{position:relative;width:100%}#receivingBankDropdown{z-index:5000}#receivingBankOptions{max-height:230px;overflow-y:auto}.receiving-bank-option{display:block;width:100%;min-height:42px;padding:10px 12px;border:0;background:#fff;color:#2c3540;text-align:left;font-size:14px;cursor:pointer;box-sizing:border-box}.receiving-bank-option:hover,.receiving-bank-option.selected{background:#2d68bd;color:#fff}`;
document.head.appendChild(receivingBankDropdownStyle);




