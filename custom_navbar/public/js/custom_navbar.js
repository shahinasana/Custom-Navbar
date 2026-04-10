$(document).ready(function () {
    setTimeout(() => {
        loadNavbarFromSettingsCustom()
        loadSearchSettings()
        // injectCustomNavbar();
        // $('.navbar .navbar-nav').hide();
    }, 500);
    setTimeout(loadSearchSettings, 500);

    frappe.router.on('change', () => {
        setTimeout(loadSearchSettings, 300);
    });
});

function loadNavbarFromSettingsCustom() {
    frappe.call({
        method: "custom_navbar.api.get_navbar_settings",
        args: {
            doctype: "Custom Navbar Settings",
            name: "Custom Navbar Settings"
        },
        callback: function (r) {
            console.log("Navbar settings:", r.message);
            if (r.message.enable==1)
            {
                injectCustomNavbar();
                $('.navbar .navbar-nav').hide();
                $('.search-bar, .awesomplete').hide();  
                renderCustomNavbar(r.message.navbar_items);
            }
            else
            {
                $('.navbar .navbar-nav').show();
                $('.search-bar, .awesomplete').show();  
            }

        }
    });
}

function loadSearchSettings() {
    frappe.call({
        method: "custom_navbar.api.get_search_settings",
        callback: function (res) {

            if (!res.message) return;

            SEARCH_SETTINGS = res.message;

            applySearchVisibility();  // ✅ control UI once
        }
    });
}

function applySearchVisibility() {

    if (!SEARCH_SETTINGS) return;

    // $('.search-bar, .awesomplete').hide(); 
    if (SEARCH_SETTINGS.show_search==1) {  
        $('#search-container').show(); 
               
        return;
    }
    else {  
        $('#search-container').hide();  
        // $('.search-bar, .awesomplete').hide();      
    }
}

function renderCustomNavbar(items) {

    // Remove old dynamic menus
    $('.custom-menu').remove();
    $('.floating-menu-content').remove();

    items = items.filter(i => i.is_active);
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    let groups = {};

    // Create groups
    items.forEach(item => {
        if (item.is_group) {
            groups[item.menu_label] = {
                icon: item.icon || '',
                children: []
            };
        }
    });

    // Assign children
    items.forEach(item => {
        if (!item.is_group && item.parent_menu) {
            if (groups[item.parent_menu]) {
                groups[item.parent_menu].children.push(item);
            }
        }
    });

    let navbarHTML = '';

    Object.keys(groups).forEach(group => {

        let groupData = groups[group];
        let menuId = group.replace(/\s+/g, '-').toLowerCase();

        let iconHTML = groupData.icon
            ? `<i class="${groupData.icon}"></i>`
            : '';

        // Add menu to CUSTOM navbar
        navbarHTML += `
            <div class="menu-group custom-menu" data-menu="${menuId}">
                <span class="menu-caption">${iconHTML} ${group} ▾</span>
            </div>
        `;

        let submenu = `<div class="floating-menu-content" id="${menuId}-menu-content">`;

        groupData.children
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach(child => {
                let finalRoute = '';

                    if (child.route && child.route.trim() !== '') {
                        finalRoute = child.route;
                    } else {
                        finalRoute = child.menu_label
                            .toLowerCase()
                            .replace(/\s+/g, '-'); // convert spaces to dash
                    }

                    submenu += `
                        <a href="/app/${finalRoute}">
                            ${child.menu_label}
                        </a>
                    `;
            });

        submenu += `</div>`;

        $('body').append(submenu);
    });

    // 🔥 IMPORTANT: inject into YOUR custom navbar
    $('.navbar-custom .nav-left').append(navbarHTML);

    bindDynamicMenuEvents();
}

function bindDynamicMenuEvents() {

    let currentOpenMenu = null;
    let timeout;

    $('.menu-group').hover(
        function () {
            let menu = $(this).data('menu');
            let id = menu + '-menu-content';

            clearTimeout(timeout);

            const offset = $(this).offset();

            $('#' + id).css({
                top: offset.top + $(this).outerHeight(),
                left: offset.left,
                display: 'block'
            });

            currentOpenMenu = id;
        },
        function () {
            let menu = $(this).data('menu');
            let id = menu + '-menu-content';

            timeout = setTimeout(() => {
                if (!$('#' + id).is(':hover')) {
                    $('#' + id).hide();
                }
            }, 200);
        }
    );

    $('.floating-menu-content').hover(
        function () {
            clearTimeout(timeout);
            $(this).show();
        },
        function () {
            $(this).hide();
        }
    );
}

function bindMenuEvents() {

    $('.menu-group').hover(
        function () {
            let menu = $(this).data('menu');
            showMenu(menu + '-menu-content', this);
        },
        function () {
            let menu = $(this).data('menu');
            hideMenu(menu + '-menu-content');
        }
    );

    $('.floating-menu-content').hover(
        function () {
            $(this).show();
        },
        function () {
            $(this).hide();
        }
    );
}

function showMenu(menuId, element) {
    let offset = $(element).offset();

    $('#' + menuId).css({
        top: offset.top + $(element).outerHeight(),
        left: offset.left,
        position: 'absolute',
        display: 'block'
    });
}

function hideMenu(menuId) {
    setTimeout(() => {
        if (!$('#' + menuId).is(':hover')) {
            $('#' + menuId).hide();
        }
    }, 200);
}

(function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }
})();

window.stopAvatarLoop = function(el) {
    el.onerror = null; 
    el.src = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZGRkZGRkIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDEyYy0yLjIxIDAtNC0xLjc5LTQtNHMxLjc5LTQgNC00IDQgMS43OSA0IDQtMS43OSA0LTQgNHptMCAyYzIuNjcgMCA4IDEuMzMgOCA0djJIMTR2LTJoLTR2Mkg0di0yYzAtMi42NyA1LjMzLTQgOC00eiIvPjwvc3ZnPg==";
};

$(document).on('app_ready', function() {
    // injectCustomNavbar();
    // $('#notif-count-badge').hide();
    // $('.navbar .navbar-nav').hide();

    loadNavbarFromSettingsCustom();

    const widthBtn = document.getElementById("fullwidth-toggle");
    if (widthBtn) {
        widthBtn.addEventListener("click", function () {
            frappe.ui.toolbar.toggle_full_width();
        });
    }
    
    setTimeout(() => {
        setCompanyDisplayName();
    }, 800);
});

function setCompanyDisplayName() {

    frappe.call({
        method: "custom_navbar.api.get_navbar_settings",
        callback: function (r) {
            console.log("==="+r.message)
            if (r.message) {
                console.log(r.message)

                // ✅ Set name
                if (r.message.display_name) {
                    $('.brand-gold').text(r.message.display_name);
                }

                // ✅ Hide switch company
                if (r.message.show_custom_name == 1) {
                    $('#switch-company').hide();
                } else {
                    $('#switch-company').show();
                }
            }
        }
    });
}

function injectCustomNavbar() {
    if ($('.navbar-custom').length > 0) return;
    
    // Hide real navbar
    $('.navbar.navbar-default').css({'opacity': '0', 'pointer-events': 'none', 'position': 'absolute'});
    
    const user = frappe.session.user;
    const user_info = frappe.user_info(user);
    const user_image = user_info?.image || '/assets/frappe/images/ui/avatar.svg';

    var navbarHTML = `
        <nav class="navbar-custom">
            <div class="nav-left">
                <a href="/app" class="brand-gold"></a>
               
            </div>
            
            <div class="nav-right">
                <div id="search-container">
                    <input type="text" id="custom-nav-search" placeholder="Search (Ctrl + G)..." autocomplete="off" />
                </div>
                
                <div class="nav-icon-btn" id="custom-notif-bell">
                    <i class="fa fa-bell"></i>
                    <span id="notif-count-badge" class="badge-pill" style="display:none;"></span>
                </div>

                <div class="nav-dropdown-user">
                    <div class="user-avatar-wrapper">
                        ${getAvatarHTML(user_image)}
                    </div>
                    <div class="user-menu-content">
                        <div class="user-info">
                            <div class="user-name">${escapeHtml(frappe.session.user_fullname || frappe.session.user)}</div>
                            <div class="user-email">${escapeHtml(frappe.session.user)}</div>
                        </div>
                        <div class="user-menu-divider"></div>
                        <div class="user-menu-item toggle-item" id="theme-toggle">
                            <i class="fa fa-moon-o"></i> 
                            <span>Toggle Theme</span>
                        </div>
                        <div class="user-menu-item toggle-item" id="fullwidth-toggle">
                            <i class="fa fa-arrows-alt"></i> 
                            <span>Toggle Full Width</span>
                        </div>
                        <div class="user-menu-item toggle-item" id="switch-company">
                            <i class="fa fa-exchange"></i>
                            <span>Switch Company</span>
                        </div>
                        <div class="user-menu-divider"></div>
                        <a href="#" onclick="return frappe.app.logout();" class="user-menu-item logout">
                            <i class="fa fa-sign-out"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    `;

    const searchModal = `
        <div id="advanced-search-modal" style="
            display:none;
            position:fixed;
            top:0; left:0;
            width:100%; height:100%;
            background:rgba(0,0,0,0.4);
            align-items:center;
            justify-content:center;
            z-index: 20000 !important;
        ">
            <div style="
                width:600px;
                background:white;
                border-radius:10px;
                padding:15px;
                box-shadow:0 10px 30px rgba(0,0,0,0.2);
            ">
                <input type="text" id="advanced-search-input" placeholder="Search anything..."
                style="
                    width:100%;
                    height:40px;
                    border:none;
                    border-bottom:1px solid #ddd;
                    font-size:16px;
                    outline:none;
                ">
                <div id="search-results" style="
                    max-height:300px;
                    overflow-y:auto;
                    margin-top:10px;
                "></div>
            </div>
        </div>
    `;

    $('body').append(searchModal);
    
    var customCSS = `
        <style>
    

            body { padding-top: 60px !important; }
            .navbar-custom {
                background: #1e2b38;
                color: white; padding: 0 20px; height: 60px;
                display: flex; align-items: center; justify-content: space-between;
                position: fixed; top: 0; left: 0; right: 0; 
                z-index: 999999!important;
                transition: background 0.3s ease;
            }
            .nav-left, .nav-right { display: flex; align-items: center; height: 100%; }
            .brand-gold { font-weight: bold; color: #ffb400 !important; font-size: 18px; text-decoration: none; margin-right: 20px; }
            
            /* MENU GROUP STYLES */
            .menu-group { 
                position: relative; 
                padding: 0 15px; 
                cursor: pointer; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                color: white;
                transition: color 0.3s ease;
            }
            
            /* Floating menus - attached to body */
            .floating-menu-content {
                position: fixed;
                background: white;
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                min-width: 200px;
                z-index: 999999 !important;
                overflow: hidden;
                animation: dropdownFade 0.2s ease;
            }
            
            .floating-menu-content a {
                display: block;
                padding: 10px 16px;
                color: #333 !important;
                text-decoration: none;
                font-size: 13px;
                border-bottom: 1px solid #f0f0f0;
                background: white;
                transition: all 0.2s ease;
            }
            
            .floating-menu-content a:last-child {
                border-bottom: none;
            }
            
            .floating-menu-content a:hover {
                background: #f5f7fa;
                padding-left: 20px;
            }

            /* SEARCH STYLES */
            #search-container { 
                position: relative; 
                margin: 0 15px;
            }
            #custom-nav-search {
                background: rgba(255,255,255,0.1); 
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px; 
                color: white; 
                padding: 8px 12px; 
                width: 220px;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            #custom-nav-search:focus { 
                background: white; 
                color: #333; 
                width: 320px; 
                outline: none;
                border-color: #ffb400;
            }
            #custom-nav-search:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-1px);
            }
            #custom-nav-search::placeholder {
                color: rgba(255,255,255,0.7);
            }
            #custom-nav-search:focus::placeholder {
                color: #999;
            }

            /* Custom Search Dropdown */
            .custom-search-dropdown {
                position: fixed;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                max-height: 350px;
                overflow-y: auto;
                z-index: 9999999 !important;
                font-family: inherit;
                min-width: 220px;
                animation: dropdownFade 0.2s ease;
            }
            
            .custom-search-dropdown ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .custom-search-dropdown li {
                padding: 10px 16px;
                cursor: pointer;
                font-size: 13px;
                color: #36414c;
                border-bottom: 1px solid #f0f0f0;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .custom-search-dropdown li:hover {
                background: #f5f7fa;
                transform: translateX(2px);
            }
            
            .custom-search-dropdown li.selected {
                background: #f5f7fa;
                transform: translateX(2px);
            }
            
            .custom-search-dropdown li:last-child {
                border-bottom: none;
            }
            
            .search-section-header {
                background: #fafbfc;
                padding: 8px 16px;
                font-size: 11px;
                font-weight: 600;
                color: #6c7a89;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #f0f0f0;
                cursor: default;
            }
            
            .search-section-header:hover {
                background: #fafbfc;
                transform: none;
            }
            
            .no-results, .loading-results {
                padding: 20px;
                text-align: center;
                color: #8d99a6;
                font-size: 12px;
            }
            
            .loading-results i {
                margin-right: 8px;
            }
            
            .nav-icon-btn { cursor: pointer; font-size: 18px; margin-left: 15px; margin-right:15px; position: relative; color: white; transition: color 0.3s ease; }
            .badge-pill { position: absolute; top: -5px; right: -5px; background: red; font-size: 10px; padding: 2px 5px; border-radius: 50%; }

            /* USER DROPDOWN WRAPPER */
            .nav-dropdown-user {
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
            }

            /* AVATAR */
            .user-avatar-wrapper {
                width: 36px;
                height: 36px;
            }

            .user-avatar-img,
            .user-avatar-fallback {
                width: 36px;
                height: 36px;
                border-radius: 50%;
            }

            .user-avatar-img {
                object-fit: cover;
            }

            .user-avatar-fallback {
                display: flex;
                align-items: center;
                justify-content: center;
                background: #5e64ff;
                color: #fff;
                font-weight: 600;
                font-size: 14px;
            }

            /* DROPDOWN MENU */
            .user-menu-content {
                display: none;
                position: absolute;
                top: 48px;
                right: 0;
                width: 240px;
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                z-index: 999999;
                animation: dropdownFade 0.2s ease;
                border: 1px solid #e0e0e0;
            }

            .nav-dropdown-user:hover .user-menu-content {
                display: block;
            }

            .user-info {
                padding: 12px 14px;
                background: #f9fafb;
                border-bottom: 1px solid #e0e0e0;
            }

            .user-name {
                font-weight: 600;
                font-size: 14px;
                color: #2f2f2f;
            }

            .user-email {
                font-size: 12px;
                color: #888;
                margin-top: 2px;
                word-break: break-all;
            }

            .user-menu-divider {
                height: 1px;
                background: #eee;
                margin: 4px 0;
            }

            .user-menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                font-size: 13px;
                color: #333;
                text-decoration: none;
                transition: all 0.2s ease;
            }

            .user-menu-item i {
                width: 16px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }

            .user-menu-item:hover {
                background: #f5f7fa;
                color: #000;
                transform: translateX(2px);
            }

            .user-menu-item.logout {
                color: #e03131;
            }

            .user-menu-item.logout i {
                color: #e03131;
            }

            .user-menu-item.logout:hover {
                background: #fff5f5;
            }

            .toggle-item {
                cursor: pointer;
            }

            @keyframes dropdownFade {
                from {
                    opacity: 0;
                    transform: translateY(8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .nav-dropdown-user::after {
                content: "";
                position: absolute;
                top: 100%;
                right: 0;
                width: 100%;
                height: 12px;
            }

 
            





            [data-theme="dark"] .floating-menu-content {
                background: #2d2d2d;
                border-color: #444;
            }
            
            [data-theme="dark"] .floating-menu-content a {
                color: #e0e0e0 !important;
                border-bottom-color: #444;
                background: #1a1a1a;
            }
            
            [data-theme="dark"] .floating-menu-content a:hover {
                background: #3d3d3d;
            }
            
            [data-theme="dark"] .custom-search-dropdown {
                background: #2d2d2d;
                border-color: #444;
            }
            
            [data-theme="dark"] .custom-search-dropdown li {
                color: #e0e0e0;
                border-bottom-color: #444;
            }
            
            [data-theme="dark"] .custom-search-dropdown li:hover {
                background: #3d3d3d;
            }
            
            [data-theme="dark"] .custom-search-dropdown li.selected {
                background: #3d3d3d;
            }
            

            
            [data-theme="dark"] .no-results, 
            [data-theme="dark"] .loading-results {
                color: #aaa;
            }

            
            [data-theme="dark"] #custom-nav-search:focus {
                background: #3d3d3d;
                color: #ffffff;
                border-color: #ffffff;
            }
            
            [data-theme="dark"] #custom-nav-search:hover {
                background: #3d3d3d;
                border-color: #ffffff;
            }
            
            [data-theme="dark"] .user-menu-content {
                background: #2d2d2d;
                border-color: #444;
            }
            
            [data-theme="dark"] .user-info {
                background: #252525;
                border-bottom-color: #444;
            }
            
            [data-theme="dark"] .user-name {
                color: #e0e0e0;
            }
            
            [data-theme="dark"] .user-email {
                color: #999;
            }
            
            [data-theme="dark"] .user-menu-divider {
                background: #444;
            }
            
            [data-theme="dark"] .user-menu-item {
                color: #e0e0e0;
            }
            
            [data-theme="dark"] .user-menu-item i {
                color: #999;
            }
            
            [data-theme="dark"] .user-menu-item:hover {
                background: #3d3d3d;
                color: #ffffff;
            }
        </style>
    `;
    
    $('head').append(customCSS);
    $('body').prepend(navbarHTML);

    setTimeout(() => {
        loadNavbarFromSettingsCustom();
    }, 500);

    let SEARCH_SETTINGS = null;




    
    // Custom Search Implementation - Optimized
    const $searchInput = $('#custom-nav-search');
    let searchTimeout;
    let currentSelectedIndex = -1;
    let currentResults = [];
    let isDropdownVisible = false;
    
    // Common doctypes and modules - only names
    const commonItems = [
        { name: "Sales Order", route: "sales-order" },
        { name: "Sales Invoice", route: "sales-invoice" },
        { name: "Customer", route: "customer" },
        { name: "Purchase Order", route: "purchase-order" },
        { name: "Supplier", route: "supplier" },
        { name: "Item", route: "item" },
        { name: "Stock Entry", route: "stock-entry" },
        { name: "Payment Entry", route: "payment-entry" },
        { name: "Journal Entry", route: "journal-entry" },
        { name: "Account", route: "account" },
        { name: "User", route: "user" },
        { name: "Report", route: "query-report" }
    ];

    function getUserInitial() {
        const name = frappe.session.user_fullname || frappe.session.user || "U";
        return name.charAt(0).toUpperCase();
    }
    
    function handleAvatarError(img) {
        const initial = getUserInitial();
        const fallback = document.createElement("div");
        fallback.className = "user-avatar-fallback";
        fallback.innerText = initial;
        img.parentNode.replaceChild(fallback, img);
    }

    function getAvatarHTML(user_image) {
        const name = frappe.session.user_fullname || frappe.session.user || "U";
        const initial = name.charAt(0).toUpperCase();
    
        if (!user_image || user_image.includes("default") || user_image.includes("avatar.svg")) {
            return `<div class="user-avatar-fallback">${initial}</div>`;
        }
    
        return `<img src="${user_image}" class="user-avatar-img" onerror="handleAvatarError(this)">`;
    }
    
    function positionDropdown($dropdown) {
        const offset = $searchInput.offset();
        $dropdown.css({
            'top': (offset.top + $searchInput.outerHeight() + 2) + 'px',
            'right': '6.2%',
            'width': '17.4%',
            'display': 'block'
        });
    }
    
    // Handle Ctrl+G (Cmd+G on Mac) to focus on custom search
    $(document).on('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            e.stopPropagation();
            $searchInput.focus();
            $searchInput.select();
            return false;
        }
    });
    
    function performSearch(query) {
            frappe.call({
            method: "custom_navbar.api.get_search_settings",
            callback: function (res) {
    
                if (!res.message) return;
    
                let settings = res.message;

                if(settings.show_search == 1)
                {
                    $('#custom-nav-search').show();
                    if (settings.custom_search == 1)
                        {
           
                           let customItems = settings.search_items || [];
           
                           let filtered = customItems.filter(item =>
                               item.label.toLowerCase().includes(query.toLowerCase())
                           );
           
                           currentResults = filtered;
           
                           if (filtered.length > 0) {
                               showSearchDropdown(
                                   filtered.map(i => ({
                                       name: i.label,
                                       route: i.route
                                   })),
                                   null
                               );
                           } else {
                               showNoResults();
                           }
                       }
                       else
                       {
                           performDefaultSearch(query);
                       }
                }
                else{
                    $('#custom-nav-search').hide();
                }

            }
            });
        
    }

        
    function performDefaultSearch(query) {
        if (!query || query.length === 0) {
            showSearchDropdown(commonItems, null);
            return;
        }
        
        showLoading();
        
        const localResults = commonItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "DocType",
                fields: ["name"],
                filters: {
                    name: ["like", `%${query}%`],
                    istable: 0,
                    custom: 0
                },
                limit_page_length: 15
            },
            callback: function(response) {
                const apiResults = [];
                if (response.message) {
                    response.message.forEach(dt => {
                        if (!localResults.some(r => r.name === dt.name)) {
                            apiResults.push({
                                name: dt.name,
                                route: dt.name.toLowerCase().replace(/ /g, '-')
                            });
                        }
                    });
                }
                
                const allResults = [...localResults, ...apiResults];
                currentResults = allResults;
                
                if (allResults.length > 0) {
                    showSearchDropdown(allResults, null);
                } else {
                    showNoResults();
                }
            },
            error: function() {
                if (localResults.length > 0) {
                    showSearchDropdown(localResults, null);
                } else {
                    showNoResults();
                }
            }
        });
    }
    
    function showSearchDropdown(items, title = null) {
        let $dropdown = $('.custom-search-dropdown');
        if ($dropdown.length === 0) {
            $dropdown = $('<div class="custom-search-dropdown"></div>');
            $('body').append($dropdown);
        }
        
        let html = '<ul>';
        
        if (title) {
            html += `<li class="search-section-header">${escapeHtml(title)}</li>`;
        }
        
        items.forEach((item, index) => {
            html += `<li data-route="${escapeHtml(item.route)}" data-name="${escapeHtml(item.name)}" data-index="${index}">
                        ${escapeHtml(item.name)}
                    </li>`;
        });
        
        html += '</ul>';
        
        $dropdown.html(html);
        positionDropdown($dropdown);
        
        $dropdown.find('li:not(.search-section-header)').off('click').on('click', function() {
            const route = $(this).data('route');
            if (route) {
                $searchInput.val('');
                hideSearchDropdown();
                frappe.set_route(route);
            }
        });
        
        currentSelectedIndex = -1;
        $dropdown.find('li.selected').removeClass('selected');
        isDropdownVisible = true;
    }
    
    function showLoading() {
        let $dropdown = $('.custom-search-dropdown');
        if ($dropdown.length === 0) {
            $dropdown = $('<div class="custom-search-dropdown"></div>');
            $('body').append($dropdown);
        }
        
        $dropdown.html('<ul><li class="loading-results"><i class="fa fa-spinner fa-spin"></i> Searching...</li></ul>');
        positionDropdown($dropdown);
        isDropdownVisible = true;
    }
    
    function showNoResults() {
        let $dropdown = $('.custom-search-dropdown');
        if ($dropdown.length === 0) {
            $dropdown = $('<div class="custom-search-dropdown"></div>');
            $('body').append($dropdown);
        }
        
        $dropdown.html('<ul><li class="no-results">No results found</li></ul>');
        positionDropdown($dropdown);
        isDropdownVisible = true;
    }
    
    function hideSearchDropdown() {
        $('.custom-search-dropdown').remove();
        currentSelectedIndex = -1;
        currentResults = [];
        isDropdownVisible = false;
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function handleKeyboardNavigation(e) {
        const $dropdown = $('.custom-search-dropdown');
        if (!$dropdown.length) return;
        
        const $items = $dropdown.find('li:not(.search-section-header)');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if ($items.length) {
                if (currentSelectedIndex < $items.length - 1) {
                    currentSelectedIndex++;
                } else {
                    currentSelectedIndex = 0;
                }
                $items.removeClass('selected');
                $items.eq(currentSelectedIndex).addClass('selected');
                $items.eq(currentSelectedIndex)[0].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if ($items.length) {
                if (currentSelectedIndex > 0) {
                    currentSelectedIndex--;
                } else {
                    currentSelectedIndex = $items.length - 1;
                }
                $items.removeClass('selected');
                $items.eq(currentSelectedIndex).addClass('selected');
                $items.eq(currentSelectedIndex)[0].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSelectedIndex >= 0 && $items.length) {
                $items.eq(currentSelectedIndex).click();
            }
        } else if (e.key === 'Escape') {
            hideSearchDropdown();
            $searchInput.blur();
        }
    }
    
    $searchInput.on('focus', function() {
        $(this).css('width', '320px');
        if (!isDropdownVisible) {
            performSearch('');
        }
    });
    
    $searchInput.on('blur', function() {
        setTimeout(() => {
            if (!$(this).is(':focus')) {
                $(this).css('width', '220px');
                setTimeout(() => {
                    if (!$('.custom-search-dropdown:hover').length) {
                        hideSearchDropdown();
                    }
                }, 200);
            }
        }, 200);
    });
    
    $searchInput.on('input', function() {
        const value = $(this).val();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (value && value.length >= 1) {
                performSearch(value);
            } else {
                performSearch('');
            }
        }, 200);
    });
    
    $searchInput.on('click', function(e) {
        e.stopPropagation();
        $(this).focus();
        if (!isDropdownVisible) {
            const currentVal = $(this).val();
            if (!currentVal) {
                performSearch('');
            }
        }
    });
    
    $searchInput.on('keydown', handleKeyboardNavigation);
    
    $(window).on('scroll resize', function() {
        if (isDropdownVisible) {
            const $dropdown = $('.custom-search-dropdown');
            if ($dropdown.length) {
                positionDropdown($dropdown);
            }
        }
    });
    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#search-container, .custom-search-dropdown').length) {
            hideSearchDropdown();
        }
    });
    
    // Handle floating menu positioning and display
    let currentOpenMenu = null;
    let menuTimeout;

    function showMenu(menuId, triggerElement) {
        if (currentOpenMenu && currentOpenMenu !== menuId) {
            $(`#${currentOpenMenu}`).hide();
        }
        
        const $menu = $(`#${menuId}`);
        const $trigger = $(triggerElement);
        const offset = $trigger.offset();
        
        $menu.css({
            'top': offset.top + $trigger.outerHeight() + 'px',
            'left': offset.left + 'px',
            'display': 'block'
        });
        
        currentOpenMenu = menuId;
    }

    function hideMenu(menuId, delay = 200) {
        clearTimeout(menuTimeout);
        menuTimeout = setTimeout(() => {
            if (currentOpenMenu === menuId) {
                $(`#${menuId}`).hide();
                currentOpenMenu = null;
            }
        }, delay);
    }

    $('.menu-group[data-menu="sales"]').hover(
        function() { showMenu('sales-menu-content', this); },
        function() { hideMenu('sales-menu-content'); }
    );

    $('.menu-group[data-menu="purchase"]').hover(
        function() { showMenu('purchase-menu-content', this); },
        function() { hideMenu('purchase-menu-content'); }
    );

    $('.floating-menu-content').hover(
        function() {
            clearTimeout(menuTimeout);
            $(this).show();
            currentOpenMenu = $(this).attr('id');
        },
        function() { hideMenu($(this).attr('id')); }
    );

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.menu-group, .floating-menu-content').length) {
            $('.floating-menu-content').hide();
            currentOpenMenu = null;
            clearTimeout(menuTimeout);
            if (!$('.nav-dropdown-user').is(':hover')) {
                $('.user-menu-content').hide();
            }
        }
    });

    // ========== NOTIFICATION SYSTEM ==========
    let notifications = [];
    let isNotifDropdownVisible = false;
    let showingAllNotifs = false;
    let isLoadingNotifs = false;

    const notifStyles = `
    <style>
        .notif-dropdown {
            position: fixed;
            width:26% !important;
            max-width:26% !important;
            max-height: 550px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: dropdownFade 0.2s ease;
            z-index: 20000 !important;
        }
        
        .notif-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            color: #000000;
            font-weight: 600;
            font-size: 14px;
        }
        
        .notif-header-actions {
            display: flex;
            gap: 8px;
        }
        
        .notif-toggle-btn {
            background: #f8f9fa;
            border: 1px solid #000000;
            color: #000000;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
        }
        
        .notif-toggle-btn:hover {
            background: #000000;
            color: white;
        }
        
        .notif-toggle-btn.selected {
            background: #000000;
            color: white;
        }
        
        .notif-list {
            max-height: 450px;
            overflow-y: auto;
        }
        
        .notif-item {
            display: flex;
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
        }
        
        .notif-item:hover {
            background: #f8f9fa;
            transform: translateX(2px);
        }
        
        .notif-item.unread {
            background: #fefefe;
            border-left: 3px solid #000000;
        }
        
        .notif-icon {
            margin-right: 12px;
            width: 32px;
            height: 32px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .notif-icon i {
            color: #000000;
        }
        
        .notif-content {
            flex: 1;
            min-width: 0;
        }
        
        .notif-title {
            font-weight: 600;
            color: #000000;
            margin-bottom: 4px;
            font-size: 13px;
        }
        
        .notif-message {
            color: #666666;
            font-size: 12px;
            margin-bottom: 4px;
            line-height: 1.4;
        }
        
        .notif-time {
            color: #888888;
            font-size: 11px;
        }
        
        .notif-dot {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 8px;
            height: 8px;
            background: #000000;
            border-radius: 50%;
        }
        
        .notif-footer {
            padding: 8px;
            border-top: 1px solid #f0f0f0;
            background: #f8f9fa;
            text-align: center;
        }
        
        .notif-mark-all {
            background: #000000;
            border: none;
            color: white;
            font-size: 12px;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            width: 100%;
            transition: all 0.2s;
            font-weight: 500;
        }
        
        .notif-mark-all:hover {
            background: #333333;
            transform: translateY(-1px);
        }
        
        .no-notif {
            text-align: center;
            padding: 40px 20px;
            color: #888888;
        }
        
        .no-notif i {
            font-size: 40px;
            color: #e0e0e0;
            margin-bottom: 12px;
            display: block;
        }
        
        .loading-notif {
            text-align: center;
            padding: 40px 20px;
            color: #888888;
        }
        
        .loading-notif i {
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .modal {
    top: 70px; /* adjust based on your navbar height */
}
        
        /* Dark mode notification styles */
        [data-theme="dark"] .notif-dropdown {
            width:26% !important;
            background: #252525;
            border:1px solid #444 !important;
        }

        .notif-dropdown {
        background: #ffffff;
            width:26% !important;
            border:1px solid #e0e0e0 !important;
}
        .notif-header {
         width:100% !important;
   
        }
        [data-theme="dark"] .notif-header {
         width:100% !important;
            background: #252525;
            border-bottom-color: #444;
            color: #ffffff;
        }

            .notif-toggle-btn{
            background: #252525;
            border-color: #252525;
            color: #e0e0e0;
        }
        
            .notif-toggle-btn:hover {
            background: #e0e0e0;
            border-color: #e0e0e0;
            color: #252525;
        }
        
        [data-theme="dark"] .notif-toggle-btn {
            background: #252525;
            border-color: #252525;
            color: #ffffff;
        }
        
        [data-theme="dark"] .notif-toggle-btn:hover {
            background: #ffffff;
            color: #252525;
        }
        
        [data-theme="dark"] .notif-item {
            border-bottom-color: #444;
        }
        
        [data-theme="dark"] .notif-item:hover {
            background: #3d3d3d;
        }
        
        [data-theme="dark"] .notif-item.unread {
            background: #353535;
            border-left-color: #ffffff;
        }
        
        [data-theme="dark"] .notif-icon {
            background: #252525;
        }
        
        [data-theme="dark"] .notif-icon i {
            color: #ffffff;
        }
        
        [data-theme="dark"] .notif-title {
            color: #ffffff;
        }
        
        [data-theme="dark"] .notif-message {
            color: #cccccc;
        }
        
        [data-theme="dark"] .notif-time {
            color: #999999;
        }
        
        [data-theme="dark"] .notif-dot {
            background: #ffffff;
        }
        
        [data-theme="dark"] .notif-footer {
            background: #252525;
            border-top-color: #444;
        }
        
        [data-theme="dark"] .notif-mark-all {
            background: #2d2d2d;
            color: #ffffff;
        }
        
        [data-theme="dark"] .notif-mark-all:hover {
            background: #252525;
            color: #ffffff;
        }
        
        [data-theme="dark"] .no-notif {
            color: #cccccc;
        }
        
        [data-theme="dark"] .no-notif i {
            color: #444;
        }
        
        [data-theme="dark"] .loading-notif {
            color: #cccccc;
        }
    </style>
    `;

    if (!$('#notif-styles').length) {
        $('head').append('<style id="notif-styles">' + notifStyles + '</style>');
    }

    function updateNotifBadge() {
        const unreadCount = notifications.filter(n => n.read !== 1).length;
        const $badge = $('#notif-count-badge');
        if (unreadCount > 0 && !isLoadingNotifs) {
            $badge.text(unreadCount).show();
        } else {
            $badge.hide();
        }
    }

    function fetchNotifs(callback) {
        if (isLoadingNotifs) {
            if (callback) setTimeout(() => callback(), 100);
            return;
        }
        isLoadingNotifs = true;
        updateNotifBadge();
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Notification Log",
                fields: ["name", "subject", "email_content", "creation", "read", "document_type", "document_name"],
                filters: { for_user: frappe.session.user },
                order_by: "creation desc",
                limit_page_length: 50
            },
            callback: function(r) {
                notifications = r.message || [];
                isLoadingNotifs = false;
                updateNotifBadge();
                if (callback) callback();
            },
            error: function() {
                notifications = [];
                isLoadingNotifs = false;
                updateNotifBadge();
                if (callback) callback();
            }
        });
    }

    function positionNotifDropdown() {
        const $bell = $('#custom-notif-bell');
        const offset = $bell.offset();
        const $dropdown = $('#notification-dropdown');
        if ($dropdown.length) {
            $dropdown.css({
                'position': 'fixed',
                'top': (offset.top + $bell.outerHeight() + 5) + 'px',
                'right': ($(window).width() - (offset.left + $bell.outerWidth())) + 'px',
                'display': 'block',
                'z-index': '20000'
            });
        }
    }

    function renderNotifDropdown() {
        $('#notification-dropdown').remove();
        showingAllNotifs = false;
        const unreadCount = notifications.filter(n => n.read !== 1).length;
        const allCount = notifications.length;
        const hasUnread = unreadCount > 0;
        let displayNotifs = notifications.filter(n => n.read !== 1);
        
        let html = `
            <div id="notification-dropdown" class="notif-dropdown">
                <div class="notif-header">
                    Notifications
                    <div class="notif-header-actions">
                        <button class="notif-toggle-btn" id="notif-toggle-btn">Show all (${allCount})</button>
                    </div>
                </div>
                <div class="notif-list">
        `;
        
        if (displayNotifs.length === 0) {
            html += `<div class="no-notif"><i class="fa fa-bell-slash"></i><p>No unread notifications</p></div>`;
        } else {
            displayNotifs.forEach(notif => {
                const message = (notif.email_content || notif.subject || "").replace(/<[^>]*>/g, '').substring(0, 100);
                const timeAgo = formatNotifTime(notif.creation);
                html += `<div class="notif-item unread" data-id="${notif.name}" data-doctype="${notif.document_type || ''}" data-docname="${notif.document_name || ''}">
                            <div class="notif-icon"><i class="fa ${getNotifIcon(notif.document_type)}"></i></div>
                            <div class="notif-content">
                                <div class="notif-title">${escapeNotifHtml(notif.subject || 'Notification')}</div>
                                <div class="notif-message">${escapeNotifHtml(message)}</div>
                                <div class="notif-time">${timeAgo}</div>
                            </div>
                            <div class="notif-dot"></div>
                        </div>`;
            });
        }
        
        html += `</div>${hasUnread ? `<div class="notif-footer"><button class="notif-mark-all" id="notif-mark-all">Mark all as read (${unreadCount})</button></div>` : ''}</div>`;
        
        $('body').append(html);
        positionNotifDropdown();
        
        $('.notif-item').off('click').on('click', function() {
            const id = $(this).data('id');
            const doctype = $(this).data('doctype');
            const docname = $(this).data('docname');
            markNotifAsRead(id);
            if (doctype && docname) frappe.set_route('Form', doctype, docname);
            $('#notification-dropdown').fadeOut(200);
            isNotifDropdownVisible = false;
        });
        
        $('#notif-toggle-btn').off('click').on('click', function(e) {
            e.stopPropagation();
            showAllNotifs();
        });
        
        $('#notif-mark-all').off('click').on('click', function(e) {
            e.stopPropagation();
            markAllNotifsAsRead();
            $('#notification-dropdown').fadeOut(200);
            isNotifDropdownVisible = false;
        });
        
        isNotifDropdownVisible = true;
    }

    function showAllNotifs() {
        $('#notification-dropdown').remove();
        showingAllNotifs = true;
        const allCount = notifications.length;
        const unreadCount = notifications.filter(n => n.read !== 1).length;
        
        let html = `
            <div id="notification-dropdown" class="notif-dropdown">
                <div class="notif-header">
                    Notifications
                    <div class="notif-header-actions">
                        <button class="notif-toggle-btn selected" id="notif-toggle-back-btn">Show all (${allCount})</button>
                    </div>
                </div>
                <div class="notif-list">
        `;
        
        if (notifications.length === 0) {
            html += `<div class="no-notif"><i class="fa fa-bell-slash"></i><p>No notifications</p></div>`;
        } else {
            notifications.forEach(notif => {
                const isUnread = notif.read !== 1;
                const message = (notif.email_content || notif.subject || "").replace(/<[^>]*>/g, '').substring(0, 100);
                const timeAgo = formatNotifTime(notif.creation);
                html += `<div class="notif-item ${isUnread ? 'unread' : ''}" data-id="${notif.name}" data-doctype="${notif.document_type || ''}" data-docname="${notif.document_name || ''}">
                            <div class="notif-icon"><i class="fa ${getNotifIcon(notif.document_type)}"></i></div>
                            <div class="notif-content">
                                <div class="notif-title">${escapeNotifHtml(notif.subject || 'Notification')}</div>
                                <div class="notif-message">${escapeNotifHtml(message)}</div>
                                <div class="notif-time">${timeAgo}</div>
                            </div>
                            ${isUnread ? '<div class="notif-dot"></div>' : ''}
                        </div>`;
            });
        }
        
        html += `</div>${unreadCount > 0 ? `<div class="notif-footer"><button class="notif-mark-all" id="notif-mark-all">Mark all as read (${unreadCount})</button></div>` : ''}</div>`;
        
        $('body').append(html);
        positionNotifDropdown();
        
        $('.notif-item').off('click').on('click', function() {
            const id = $(this).data('id');
            const doctype = $(this).data('doctype');
            const docname = $(this).data('docname');
            markNotifAsRead(id);
            if (doctype && docname) frappe.set_route('Form', doctype, docname);
            $('#notification-dropdown').fadeOut(200);
            isNotifDropdownVisible = false;
        });
        
        $('#notif-toggle-back-btn').off('click').on('click', function(e) {
            e.stopPropagation();
            showNotifDropdown();
        });
        
        $('#notif-mark-all').off('click').on('click', function(e) {
            e.stopPropagation();
            markAllNotifsAsRead();
            showNotifDropdown();
        });
        
        isNotifDropdownVisible = true;
    }

    function showNotifDropdown() {
        if (isLoadingNotifs) {
            $('#notification-dropdown').remove();
            const loadingHtml = `<div id="notification-dropdown" class="notif-dropdown"><div class="notif-header">Notifications</div><div class="loading-notif"><i class="fa fa-spinner fa-spin"></i><p>Loading...</p></div></div>`;
            $('body').append(loadingHtml);
            positionNotifDropdown();
            fetchNotifs(() => renderNotifDropdown());
            return;
        }
        if (notifications.length === 0) {
            fetchNotifs(() => renderNotifDropdown());
            return;
        }
        renderNotifDropdown();
    }

    function markNotifAsRead(id) {
        frappe.call({
            method: "frappe.client.set_value",
            args: { doctype: "Notification Log", name: id, fieldname: "read", value: 1 },
            callback: () => {
                const notif = notifications.find(n => n.name === id);
                if (notif) notif.read = 1;
                updateNotifBadge();
            }
        });
    }

    function markAllNotifsAsRead() {
        const unread = notifications.filter(n => n.read !== 1);
        unread.forEach(notif => {
            frappe.call({ method: "frappe.client.set_value", args: { doctype: "Notification Log", name: notif.name, fieldname: "read", value: 1 } });
            notif.read = 1;
        });
        updateNotifBadge();
    }

    function getNotifIcon(doctype) {
        if (!doctype) return 'fa-bell';
        const d = doctype.toLowerCase();
        if (d.includes('sales')) return 'fa-shopping-cart';
        if (d.includes('purchase')) return 'fa-truck';
        if (d.includes('customer')) return 'fa-users';
        if (d.includes('supplier')) return 'fa-building';
        return 'fa-bell';
    }

    function formatNotifTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    }

    function escapeNotifHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function showCompanySwitcherDialog() {

        frappe.call({
            method: "custom_navbar.api.get_allowed_companies",
            callback: function (r) {
    
                let companies = r.message || [];
    
                // ❌ No companies → block
                if (!companies.length) {
                    frappe.msgprint("No company access assigned. Contact Administrator.");
                    return;
                }
    
                renderDialog(companies);
            },
            error: function (err) {
                console.error(err);
                frappe.msgprint("Failed to fetch companies");
            }
        });
    
        function renderDialog(companies) {
    
            // ✅ Always get fresh default (avoid stale cache issue)
            let currentCompany = frappe.boot?.user?.defaults?.company || companies[0];
    
            // ✅ If current not in list → fallback
            if (!companies.includes(currentCompany)) {
                currentCompany = companies[0];
            }
    
            let dialog = new frappe.ui.Dialog({
                title: "Switch Company",
                fields: [
                    {
                        label: "Select Company",
                        fieldname: "company",
                        fieldtype: "Select",
                        options: companies.join("\n"),
                        default: currentCompany,
                        reqd: 1
                    }
                ],
                primary_action_label: "Set as Default",
    
                primary_action(values) {

                    frappe.call({
                        method: "custom_navbar.api.set_default_company",
                        args: {
                            company: values.company
                        },
                        freeze: true,
                        freeze_message: "Switching company...",
                
                        callback: function (r) {
                            if (!r.exc) {
                
                                // ✅ Update boot (THIS is correct way)
                                frappe.boot.user.defaults.company = values.company;
                                frappe.boot.user.defaults.default_company = values.company;
                
                                frappe.show_alert({
                                    message: "Company changed to " + values.company,
                                    indicator: "green"
                                });
                
                                dialog.hide();
                
                                // ✅ Update navbar instantly
                                updateNavbarCompanyName();
                
                                // ✅ Optional but recommended
                                setTimeout(() => location.reload(), 500);
                            }
                        },
                
                        error: function (err) {
                            console.error(err);
                            frappe.msgprint("Failed to change company");
                        }
                    });
                }
            });
    
            dialog.show();
        }
    }

    function updateNavbarCompanyName() {

        frappe.call({
            method: "custom_navbar.api.get_navbar_settings",
            callback: function (r) {
    
                let data = r.message;
                let currentCompany = frappe.boot?.user?.defaults?.company;
    
                let displayName = currentCompany;
    
                if (data && data.company_list) {
    
                    let row = data.company_list.find(
                        c => c.company === currentCompany
                    );
    
                    if (row) {
                        if (row.show_custom_name && row.custom_name) {
                            displayName = row.custom_name;
                        } else if (row.short_name) {
                            displayName = row.short_name;
                        }
                    }
                }
    
                document.querySelector(".brand-gold").innerText = displayName;
            }
        });
    }

    $(document).on('click', '#custom-notif-bell', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.floating-menu-content, .user-menu-content').hide();
        if ($('#notification-dropdown').length) {
            $('#notification-dropdown').remove();
            isNotifDropdownVisible = false;
        } else {
            showNotifDropdown();
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#custom-notif-bell, #notification-dropdown').length) {
            $('#notification-dropdown').remove();
            isNotifDropdownVisible = false;
        }
    });

    document.querySelector("#theme-toggle").addEventListener("click", () => {
        if (frappe.ui && frappe.ui.ThemeSwitcher) {
            new frappe.ui.ThemeSwitcher().show();
        }
    });

    $(document).on('click', '#fullwidth-toggle', function (e) {
        e.preventDefault();
    
        $('body').toggleClass('full-width');
    
        // optional: save preference
        const isFull = $('body').hasClass('full-width');
        localStorage.setItem('full_width', isFull ? '1' : '0');
    });

    $(document).on('click', '#switch-company', function (e) {
        showCompanySwitcherDialog();
    });


    function resetUserDropdownState() {
        const $userDropdown = $('.nav-dropdown-user');
        if (!$userDropdown.is(':hover')) {
            $('.user-menu-content').hide();
        }
    }

    $(document).on('click', '#custom-notif-bell', function() {
        setTimeout(resetUserDropdownState, 50);
    });

    $('.menu-group').on('mouseenter click', function() {
        setTimeout(resetUserDropdownState, 50);
    });

    $(document).off('mouseenter mouseleave', '.nav-dropdown-user');
    $(document).on('mouseenter', '.nav-dropdown-user', function() {
        $('.floating-menu-content').hide();
        $('#notification-dropdown').hide();
        isNotifDropdownVisible = false;
        currentOpenMenu = null;
        $(this).find('.user-menu-content').show();
    });

    $(document).on('mouseleave', '.nav-dropdown-user', function() {
        const $this = $(this);
        setTimeout(function() {
            if (!$this.is(':hover') && !$this.find('.user-menu-content').is(':hover')) {
                $this.find('.user-menu-content').hide();
            }
        }, 100);
    });

    $(document).on('mouseenter', '.user-menu-content', function() {
        $(this).show();
    });

    $(document).on('mouseleave', '.user-menu-content', function() {
        const $parent = $(this).closest('.nav-dropdown-user');
        if (!$parent.is(':hover')) {
            $(this).hide();
        }
    });

    // Initialize
    setTimeout(function() {
        fetchNotifs();
        setInterval(fetchNotifs, 30000);
    }, 2000);
}