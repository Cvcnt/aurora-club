import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Sparkles, Gift, ArrowRight, Check } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Gift,
      title: "Descontos Exclusivos",
      description: "Até 50% OFF em restaurantes, hotéis e experiências únicas"
    },
    {
      icon: Crown,
      title: "Acesso VIP",
      description: "Eventos exclusivos e experiências premium para membros VIP"
    },
    {
      icon: Sparkles,
      title: "Cashback",
      description: "Ganhe dinheiro de volta em suas compras favoritas"
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "Gratuito",
      description: "Perfeito para começar",
      features: [
        "Descontos em restaurantes",
        "Cashback em compras online", 
        "Acesso a eventos básicos",
        "Suporte via email"
      ],
      popular: false,
      action: "Começar grátis"
    },
    {
      name: "VIP",
      price: "R$ 29,90/mês",
      description: "Máximo de benefícios",
      features: [
        "Todos os benefícios básicos",
        "Descontos de até 50% em hotéis",
        "Acesso a eventos VIP exclusivos",
        "Spa e bem-estar premium",
        "Suporte prioritário 24/7",
        "Cashback aumentado"
      ],
      popular: true,
      action: "Upgrade para VIP"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">NEX RUMO</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button className="aurora-button" onClick={() => navigate('/auth')}>
              Começar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Aurora Club Premium Experience" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="aurora-glow inline-block p-6 rounded-2xl mb-8">
              <Crown className="h-16 w-16 text-primary mx-auto" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bem-vindo ao{' '}
              <span className="gradient-text">NEX RUMO</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Descubra um mundo de experiências exclusivas, descontos premium e benefícios únicos. 
              Sua jornada profissional começa aqui.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="aurora-button text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Começar gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-primary/20 hover:border-primary/40"
                onClick={() => navigate('/dashboard')}
              >
                Explorar benefícios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher o <span className="gradient-text">NEX RUMO</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oferecemos uma experiência premium com benefícios reais que fazem a diferença no seu dia a dia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="benefit-card text-center">
              <CardHeader>
                <div className="aurora-glow inline-block p-4 rounded-full mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu <span className="gradient-text">plano</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Comece grátis e faça upgrade quando quiser mais benefícios
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'aurora-glow border-primary/40' : 'benefit-card'}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'gold-button' : 'aurora-button'}`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar sua jornada <span className="gradient-text">profissional</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a milhares de membros que já descobriram os benefícios exclusivos do NEX RUMO.
          </p>
          <Button 
            size="lg" 
            className="aurora-button text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Começar agora
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-bold gradient-text">NEX RUMO</span>
          </div>
          <p className="text-center text-muted-foreground mt-2">
            © 2024 NEX RUMO. Experiências exclusivas para você.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;