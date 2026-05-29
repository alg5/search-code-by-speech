
# KitchenScaleCode Voice (KSC Voice)

## 📖 About

**KitchenScaleCode Voice (KSC Voice)**

KitchenScaleCode Voice (KSC Voice) is a web application that allows users to quickly find product codes for smart kitchen scales using voice input. Instead of manually scrolling through a booklet of 1000+ product codes, users can simply say the product name and instantly get the corresponding scale code.

**The Problem:** The original manufacturer booklet lists 1000+ products **only in English**, making it difficult for non-English speakers to find codes for everyday items like "Яблоки" or "תפוחים". This creates a significant barrier for elderly users, immigrants, or anyone who is not fluent in English.

**The Solution:** KSC Voice supports **4 languages** (EN, RU, HE, FR) with native voice recognition. Speak naturally in your language — get the code instantly. No language barriers, no manual scrolling.

**Extensibility:** The application is architected for easy language expansion. New languages can be added **without code changes** — simply by updating the configuration file and adding translations. This design allows the project to scale to any number of languages without redeployment.

This project was built as a personal pet-project to explore voice recognition technologies and their practical applications in everyday kitchen use.

---

## ❓ Problem Statement

Smart kitchen scales (like NK695 and compatible models) require 
users to input a **numeric product code** to get accurate 
nutritional information for each food item.


---

## 💡 Solution

This app solves the problem by providing:

1. **🎙️ Voice Search** — Say the product name, get the code instantly
2. **⌨️ Text Search** — Type the product name if you prefer
3. **📊 Nutritional Data** — View nutritional information 
   from USDA FoodData Central API
4. **⚡ Fast Lookup** — Results appear in milliseconds



User speaks: "Apple" ↓ Voice Recognition converts to text ↓ App searches database ↓ Result: Apples, fresh, with skin — Scale Code: 325
---

- ## Tech Stack

- **Frontend:** Angular 20, PrimeNG, TypeScript, SCSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Search:** Fuzzy search via PostgreSQL pg_trgm extension
- **Voice:** Web Speech API with cross-browser support
- **Deployment:** GitHub Pages

## 🎬 Demo

### Live Demo
🔗 **[Try it here](https://alg5.github.io/search-code-by-speech/)**

### Video Demo
🎥 **[Watch on YouTube](YOUR_YOUTUBE_LINK_HERE)** *(optional)*


## Screenshots
### Home Page (English)
![Home Page EN](docs/screenshots/homepage-en.png)

### Home Page (Hebrew)
![Home Page HE](docs/screenshots/homepage-he.png)

### Voice Search Active
![Voice Search](docs/screenshots/voice-search.png)

### Voice Search Active (Hebrew)
![Voice Search](docs/screenshots/voice-search-he.png)


### Search Result
![Result](docs/screenshots/result.png)

### Admin Dashboard
![Admin](docs/screenshots/admin-dashboard.png)


## ✨ Features

- **Voice Search** — hands-free product lookup using Web Speech API
- **Smart Search** — fuzzy matching powered by PostgreSQL pg_trgm extension
- **Favorites** — save frequently used products
- **Multi-language** — EN, RU, HE, FR with RTL support
- **Admin Dashboard** — manage products, categories, and search settings
- **Responsive Design** — works on desktop and mobile
- **Copy to Clipboard** — instant scale code copying

- ## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | Angular 20.3.8 | SPA framework |
| **UI Components** | PrimeNG | UI component library |
| **Styling** | SCSS | Custom styles & theming |
| **Voice Input** | Web Speech API | Speech-to-text recognition |
| **Database** | Supabase (PostgreSQL) | Data storage & REST API |
| **Search** | PostgreSQL pg_trgm | Fuzzy text matching |
| **Auth** | Supabase Auth | User authentication |
| **Deployment** | GitHub Pages | Static hosting |

## Future Improvements

- 🌍 **Multi-language voice support** — migrate to Transloco library for scalable i18n  
- 📸 **Product image recognition** — take a photo, get the code  
- 🍽️ **Meal tracking** — log daily food intake  
- 🔵 **Bluetooth integration** — send code directly to scale  
- 📱 **PWA** — install as mobile app  
- 🤖 **AI suggestions** — predict products based on time of 

- ## Author
Anna Gubanov

## ⚖️ Legal Notice
This project is an unofficial, non-commercial tool created for educational and portfolio purposes.
Scale product codes are functional/technical data used solely for device interoperability with NK695-compatible kitchen scales.
Product names and codes are sourced from publicly available documentation. This project is not affiliated with, endorsed by, or sponsored by the scale manufacturer.
Nutritional data is provided by the USDA FoodData Central API.
All trademarks and product names belong to their respective owners

## License
Copyright (c) 2026 Anna Gubanov
This project is publicly available for viewing and educational purposes only.
You may not use, copy, modify, merge, publish, distribute, sublicense, or sell
any part of this code without explicit written permission.
This project is intended as a portfolio piece and may be integrated into a
commercial product in the future.

## 👤 Contact
[Anna Gubanov]  
💼 LinkedIn: www.linkedin.com/in/anna-gubanov     
🐙 GitHub: [your-github](https://github.com/alg5)  
📧 Email: anna.gubanov1@gmail.com  


## Getting Started

```bash
# Clone repository
git clone https://github.com/alg5/search-code-by-speech.git

# Install dependencies
npm install

# Set up environment
cp src/environments/environment.example.ts src/environments/environment.ts
# Add your Supabase credentials

# Run development server
ng serve

