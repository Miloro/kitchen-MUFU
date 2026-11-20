import { useMemo, useState } from "react";
import felyChefImage from "./img/fely_chef.png";
import data from "./Data";
import "./App.css";

const { tabData, emojisTypeIngredient } = data;

function emojiForType(type) {
  const found = emojisTypeIngredient.find(
    (item) => item.name.toLowerCase() === type.toLowerCase()
  );
  return found ? found.emoji : null;
}

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  // Only the selected names are stored, so Data.js is never mutated
  const [selectedNames, setSelectedNames] = useState(() => new Set());

  const currentTab = tabData[tabIndex];

  // Sorted copy (sorting state in place during render caused bugs)
  const ingredients = useMemo(
    () =>
      [...currentTab.ingredients].sort((a, b) => a.name.localeCompare(b.name)),
    [currentTab]
  );

  const selectedIngredients = ingredients.filter((i) =>
    selectedNames.has(i.name)
  );

  function namesOfType(type) {
    return selectedIngredients.filter((i) => i.type === type).map((i) => i.name);
  }

  // Possible meals together with the selected ingredients that make them
  const meals = currentTab.meals
    .map((meal) => {
      const first = namesOfType(meal.ingredient1);
      if (meal.ingredient1 === meal.ingredient2) {
        return first.length >= 2 ? { ...meal, names: [first[0], first[1]] } : null;
      }
      const second = namesOfType(meal.ingredient2);
      return first.length && second.length
        ? { ...meal, names: [first[0], second[0]] }
        : null;
    })
    .filter(Boolean);

  function toggleIngredient(name) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleTabChange(index) {
    setTabIndex(index);
    setSelectedNames(new Set());
  }

  return (
    <div className="app">
      <nav className="tabs" aria-label="Kitchens">
        {tabData.map((tab, index) => (
          <button
            type="button"
            key={tab.label}
            className={`tab ${tabIndex === index ? "tab--selected" : ""}`}
            aria-pressed={tabIndex === index}
            onClick={() => handleTabChange(index)}
          >
            <img src={felyChefImage} alt="" className="tab__image" />
            <span className="tab__label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="layout">
        <section className="card card--ingredients" aria-label="Ingredients">
          <div className="card__scroll">
            <ul className="ingredient-list">
              {ingredients.map((ing) => {
                const selected = selectedNames.has(ing.name);
                return (
                  <li key={ing.name}>
                    <button
                      type="button"
                      className={`ingredient ${selected ? "ingredient--selected" : ""}`}
                      aria-pressed={selected}
                      onClick={() => toggleIngredient(ing.name)}
                    >
                      <span className="ingredient__emoji" aria-hidden="true">
                        {emojiForType(ing.type)}
                      </span>
                      <span className="ingredient__name">{ing.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="card card--meals" aria-label="Meals">
          <div className="card__scroll">
            <table className="meals-table">
              <thead>
                <tr>
                  <th>Ingredient 1</th>
                  <th>Ingredient 2</th>
                  <th>Buff</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal) => (
                  <tr key={`${meal.ingredient1}-${meal.ingredient2}`}>
                    <td>{meal.names[0]}</td>
                    <td>{meal.names[1]}</td>
                    <td className="meals-table__effect">{meal.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {meals.length === 0 && (
              <p className="empty">Select ingredients to see the available meals</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
