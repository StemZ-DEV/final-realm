# 🏰 Final Realm

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Inquirer](https://img.shields.io/badge/Inquirer-Prompts-red?style=for-the-badge)

**Final Realm** is a modern Terminal RPG Engine that captures the soul of early 2010s "Batch File" games but runs on a robust, type-safe **TypeScript** architecture. 

It features persistent save slots, modular entity composition, a reactive UI loop, and a color-coded loot system—all running directly in your console.

---

## 🖥️ The Interface
The engine uses a "Game Loop Renderer" pattern to prevent scrolling flicker, creating a pinned dashboard experience in the terminal.

```text
=== 🏰 FINAL REALM 🏰 ===
────────────────────────────────────────
👤 Traveler (Lvl 3)
❤️  HP: 45/50    ✨ XP: 20/100
💰  Gold: 150
────────────────────────────────────────
Recent Activity:
⚔️  You defeated the Goblin!
✨  Found [Rare] Iron Sword.
💤  You rested at the campfire.

[ ? ] What is your next move?
> Explore the Wilds
  Rest at Campfire
  Inventory
  Save Game
```

## ✨ Features

### ⚔️ Combat & Gameplay
* **Turn-Based Combat:** Tactical battles with detailed combat logs.
* **Calculated Stats:** Damage isn't static. It's calculated dynamically based on Base Stats + Equipment + Buffs.
* **Rarity System:** Items are color-coded (Common, Uncommon, Rare, Legendary) with automatic UI formatting.
* **Interactive Inventory:** Equip weapons and armor, use consumables, or drop items directly from a managed list.

### 💾 Persistence
* **Slot System:** Support for 5 distinct Save Slots.
* **Auto-Locating Saves:** Uses `conf` to store save files in the system's native AppData folder (Cross-platform).
* **JSON Serialization:** Saves persist Player Stats, Inventory (IDs), and Equipment configuration.

### 🛠️ Architecture (For Developers)
Unlike traditional "Spaghetti Code" text games, Final Realm uses **Composition over Inheritance**.

* **Entity Component System (Lite):** Players and Enemies are defined by Interfaces (`Stats`, `Inventory`), not deep class inheritance.
* **Item Registry:** Items are stored in a central database with logic functions (`use()`) attached dynamically at runtime.
* **Scene Stack:** Clean separation between the Main Menu, Combat Loop, and Inventory Screen.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* A terminal that supports ANSI colors (VS Code, Windows Terminal, iTerm2).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/StemZ-DEV/final-realm.git
    cd final-realm
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the Game**
    ```bash
    npm start
    ```

4.  **Development Mode**
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

The project follows a scalable "Feature-Folder" architecture:

```text
src/
├── core/           # Engine logic (Save System, State Manager)
├── data/           # Game Content (Item Registry, Enemy Lists)
├── entities/       # Type Definitions (Player, Item, Stats Interfaces)
├── features/       # Gameplay Systems (Combat, Inventory, Main Menu)
├── ui/             # Visual Helpers (Theme, Renderers)
└── index.ts        # Entry Point
```

## 🎮 Controls

* **Arrow Keys (↑ ↓):** Navigate Menus.
* **Enter:** Select Option / Confirm.
* **Back:** Most sub-menus have a "Go Back" option to return to the previous screen.

---

## 🗺️ Roadmap

- [x] Basic Combat Loop
- [x] Save/Load System (5 Slots)
- [x] Inventory & Equipment System
- [ ] Level Up & Stat Allocation
- [ ] Town & Merchant System
- [ ] Magic & Spellbook System

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
