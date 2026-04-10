import frappe

@frappe.whitelist()
def get_allowed_companies():
    user = frappe.session.user

    perms = frappe.get_all(
        "User Permission",
        filters={"user": user, "allow": "Company"},
        pluck="for_value"
    )

    # ✅ If user has specific company permissions
    if perms:
        return perms

    # ✅ No restriction → allow all companies (only for Administrator)
    roles = frappe.get_roles(user)
    if "Administrator" in roles:
        return frappe.get_all("Company", pluck="name")

    # ✅ Default fallback (non-admin, no user permission)
    return [frappe.defaults.get_user_default("company")]

import frappe

@frappe.whitelist()
def set_default_company(company):
    if not company:
        frappe.throw("Company is required")

    user = frappe.session.user

    # ✅ Check exists (safe)
    if not frappe.db.exists("Company", company):
        frappe.throw(f"Company '{company}' does not exist")

    # ✅ Get allowed companies
    allowed_companies = frappe.get_all(
        "User Permission",
        filters={"user": user, "allow": "Company"},
        pluck="for_value"
    )

    # ✅ Validate
    if allowed_companies and company not in allowed_companies:
        frappe.throw("You are not allowed to select this company")

    # ✅ Set defaults
    frappe.defaults.set_user_default("company", company)
    frappe.defaults.set_user_default("default_company", company)

    frappe.clear_cache(user=user)

    return {
        "status": "success",
        "company": company
    }

import frappe


@frappe.whitelist()
def get_navbar_settings():

    # ✅ Load settings (ignore permission)
    doc = frappe.get_single("Custom Navbar Settings")
    doc.flags.ignore_permissions = True

    # ✅ Priority 1: Custom Name
    if doc.show_custom_name == 1:
        return {
            "enable": doc.enable,
        "display_name": doc.custom_name,
        "show_custom_name": doc.show_custom_name,
        "navbar_items": doc.navbar_items
    }

    else:
        # ✅ Get current user company
        user = frappe.session.user
        default_company = frappe.defaults.get_user_default("company")
        if default_company:
            display_name=default_company
        else:
            display_name = ""  # ✅ Prevent undefined error

        # ✅ Priority 2: Child table
        for d in doc.company_list:
            if d.company == default_company:

                if d.short_name:
                    display_name = d.short_name.strip()
                else:
                    display_name = d.company

                break

    return {
         "enable": doc.enable,
    "display_name": display_name,
    "show_custom_name": doc.show_custom_name,
    "navbar_items": doc.navbar_items
}

@frappe.whitelist()
def get_search_settings():

    doc = frappe.get_single("Custom Navbar Settings")
    doc.flags.ignore_permissions = True

    return {
        "enable": doc.enable,
        "show_search": doc.show_search,              # 0 / 1
        "custom_search": doc.custom_search,          # 0 / 1
        "search_items": [
            {
                "label": d.search_items,
                "route": d.url
            } for d in doc.custom_search_options
        ] if doc.custom_search else []
    }