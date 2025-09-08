import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import AppHeader from '../components/AppHeader';
import { articles } from '../blog/blogContent'; // <-- 1. Importa el contenido

const ArticlePage = () => {
    const { slug } = useParams();
    const article = articles[slug]; // <-- 2. Busca el artículo por su slug

    // Si el artículo no se encuentra, muestra un mensaje
    if (!article) {
        return (
            <>
                <AppHeader />
                <div className="App" style={{textAlign: 'center', padding: '4rem 0'}}>
                    <h2>Artículo no encontrado</h2>
                    <p>La página que buscas no existe.</p>
                    <Link to="/blog">← Volver al Blog</Link>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <AppHeader />
            <div className="App" style={{textAlign: 'left', maxWidth: '800px', margin: '0 auto'}}>
                <article style={{padding: '2rem 0'}}>
                    <Link to="/blog" style={{marginBottom: '2rem', display: 'inline-block'}}>← Volver al Blog</Link>
                    
                    <h1>{article.title}</h1>
                    
                    {/* 3. Muestra el contenido HTML del artículo */}
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />

                </article>
            </div>
            <Footer />
        </>
    );
};

export default ArticlePage;