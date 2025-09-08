import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AppHeader from '../components/AppHeader';
import { articles } from '../blog/blogContent'; // Importamos el objeto con los artículos

// Convertimos el objeto de artículos en un array para poder mapearlo
const articleList = Object.keys(articles).map(slug => ({
  slug: slug,
  title: articles[slug].title
}));

const BlogPage = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* Usamos el AppHeader de la parte privada, pero podría ser uno público */}
            <AppHeader />
            <div className="App" style={{textAlign: 'left', maxWidth: '800px', margin: '0 auto'}}>
                <header style={{padding: '2rem 0'}}>
                    <h1>Blog de LabNote</h1>
                    <p style={{fontSize: '1.2rem', color: '#4A5568'}}>
                        Recursos, guías y consejos para optimizar tu trabajo en el laboratorio.
                    </p>
                </header>
                <section>
                    {articleList.map(article => (
                        <div 
                            key={article.slug} 
                            onClick={() => navigate(`/blog/${article.slug}`)}
                            className="report-card" // Reutilizamos el estilo de las tarjetas del dashboard
                        >
                            <h4 style={{marginTop: 0, marginBottom: 0}}>{article.title}</h4>
                        </div>
                    ))}
                </section>
            </div>
            <Footer />
        </>
    );
};

export default BlogPage;