export default function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <section className="page-intro">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {actions ? <div className="page-intro-actions">{actions}</div> : null}
    </section>
  );
}
