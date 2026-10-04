"use client";

import { useState } from "react";

const DEMO =
  "Mañana me levanto, me lavo los dientes, me visto, preparo la mochila y voy a la escuela.";

export default function Home() {
  const [text, setText] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [error, setError] = useState("");

  async function analyze() {
    if (!text.trim()) {
      setError("Escribí una rutina o acción.");
      return;
    }

    setLoading(true);
    setError("");
    setSteps([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo interpretar la rutina."
        );
      }

      setSteps(
        data.steps.map((s, i) => ({
          ...s,
          id: `${Date.now()}-${i}`,
          image: null
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generatePictogram(step, index) {
    setGenerating((x) => ({
      ...x,
      [step.id]: true
    }));

    setError("");

    try {
      const res = await fetch("/api/generate-pictogram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: step.action,
          description: step.description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo generar el pictograma."
        );
      }

      setSteps((current) =>
        current.map((item, i) =>
          i === index
            ? {
                ...item,
                image: data.image
              }
            : item
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating((x) => ({
        ...x,
        [step.id]: false
      }));
    }
  }

  async function generateAll() {
    for (let i = 0; i < steps.length; i++) {
      await generatePictogram(steps[i], i);
    }
  }

  function printRoutine() {
    window.print();
  }

  return (
    <main className="container">

      <header className="header no-print">
        <div>
          <div className="logo">
            PICTO W
          </div>

          <div className="muted small">
            Rutinas visuales generadas con IA
          </div>
        </div>

        <div className="badge">
          Prototipo 1.0
        </div>
      </header>

      <section className="card no-print">

        <h1>
          Convertí una rutina en pictogramas
        </h1>

        <p className="muted">
          Escribí con tus propias palabras qué tiene que hacer
          la persona. La IA separará la rutina en pasos y después
          generará un pictograma visual propio para cada acción.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej.: Mañana me levanto, me lavo los dientes, me visto, preparo la mochila y voy a la escuela."
        />

        <div className="actions">

          <button
            className="btn"
            onClick={() => setText(DEMO)}
          >
            Usar ejemplo
          </button>

          <button
            className="btn primary"
            onClick={analyze}
            disabled={loading}
          >
            {loading
              ? "Interpretando..."
              : "✨ Crear rutina"}
          </button>

        </div>

        {error && (
          <div
            className="status"
            role="alert"
          >
            {error}
          </div>
        )}

      </section>

      {steps.length > 0 && (

        <section className="routine">

          <div className="card">

            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 16
              }}
            >

              <div>

                <h2>
                  Rutina visual
                </h2>

                <div className="muted small">
                  {steps.length} pasos detectados
                </div>

              </div>

              <div
                className="actions"
                style={{
                  marginTop: 0
                }}
              >

                <button
                  className="btn"
                  onClick={generateAll}
                >
                  ✨ Generar todos
                </button>

                <button
                  className="btn primary"
                  onClick={printRoutine}
                >
                  📄 Imprimir / PDF
                </button>

              </div>

            </div>

            <h2
              className="print-title"
              style={{
                display: "none"
              }}
            >
              Mi rutina visual
            </h2>

            <div className="steps">

              {steps.map((step, index) => (

                <article
                  className="step"
                  key={step.id}
                >

                  <div className="picto">

                    {step.image ? (

                      <img
                        src={step.image}
                        alt={`Pictograma: ${step.action}`}
                      />

                    ) : (

                      <div className="placeholder">
                        Pictograma pendiente
                      </div>

                    )}

                  </div>

                  <div>

                    <div className="number">
                      PASO {index + 1}
                    </div>

                    <div className="step-title">
                      {step.label}
                    </div>

                    <div className="step-sub">
                      {step.description}
                    </div>

                  </div>

                  <button
                    className="btn generate-one no-print"
                    onClick={() =>
                      generatePictogram(
                        step,
                        index
                      )
                    }
                    disabled={
                      generating[step.id]
                    }
                  >
                    {generating[step.id]
                      ? "Generando..."
                      : step.image
                      ? "Regenerar"
                      : "Generar"}
                  </button>

                </article>

              ))}

            </div>

          </div>

        </section>

      )}

      <footer
        className="muted small no-print"
        style={{
          marginTop: 20
        }}
      >
        Las imágenes son generadas por IA y pueden
        contener una marca de agua digital.
      </footer>

    </main>
  );
}
