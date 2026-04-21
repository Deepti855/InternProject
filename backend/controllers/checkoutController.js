const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_mock_123456');
const db = require('../config/db');

exports.createCheckoutSession = async (req, res) => {
    const {
      productId,
      ecoScore,
      carbonOffset,
      includeCarbonOffset = false,
      carbonOffsetFee = 0
    } = req.body;
    
    // Fetch product details for line items
    db.get('SELECT products.*, sd.material_name FROM products JOIN sustainability_data sd ON products.material_id = sd.id WHERE products.id = ?', [productId], async (err, product) => {
        if (err || !product) return res.status(404).json({ message: "Product not found" });

        try {
            const lineItems = [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: product.name,
                    description: `Eco-Friendly: ${product.material_name}. Supporting sustainability.`,
                    metadata: { material: product.material_name }
                  },
                  unit_amount: Math.round(product.price * 100),
                },
                quantity: 1,
              },
            ];

            const offsetFeeNumber = Number(carbonOffsetFee || 0);
            if (includeCarbonOffset && offsetFeeNumber > 0) {
              lineItems.push({
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: 'Carbon Offset Contribution',
                    description: 'Optional contribution to offset estimated shipping and lifecycle emissions.',
                  },
                  unit_amount: Math.round(offsetFeeNumber * 100),
                },
                quantity: 1,
              });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop`,
                metadata: {
                    productId: productId.toString(),
                    eco_score: ecoScore.toString(),
                    carbon_offset: carbonOffset.toString(),
                    include_carbon_offset: String(!!includeCarbonOffset),
                    carbon_offset_fee: String(offsetFeeNumber || 0),
                    base_price: String(product.price),
                    buyer_id: String(req.user.id || '')
                }
            });

            res.json({ id: session.id, url: session.url });
        } catch (error) {
            console.error('Stripe session creation error:', error);
            res.status(500).json({ message: 'Failed to create checkout session' });
        }
    });
};

exports.getSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve session' });
    }
};

exports.completeCheckout = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId is required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const productId = Number(session.metadata?.productId);
    const ecoScore = Number(session.metadata?.eco_score || 0);
    const buyerId = req.user.id;

    db.get('SELECT name FROM products WHERE id = ?', [productId], (err, product) => {
      if (err || !product) return res.status(404).json({ message: 'Product not found' });

      db.get('SELECT username FROM users WHERE id = ?', [buyerId], (userErr, buyer) => {
        if (userErr || !buyer) return res.status(404).json({ message: 'Buyer not found' });

        const content = `${buyer.username} just bought ${product.name}! Impact: ${ecoScore}/100.`;
        db.run(
          `INSERT INTO posts (title, content, user_id, sustainability_category, sustainability_score, product_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['Eco Purchase Update', content, buyerId, 'eco-friendly', ecoScore, productId],
          function (postErr) {
            if (postErr) return res.status(500).json({ message: 'Failed to create purchase post' });
            req.app.get('io').emit('new_post', {
              id: this.lastID,
              title: 'Eco Purchase Update',
              content,
              user_id: buyerId,
              username: buyer.username,
              sustainability_category: 'eco-friendly',
              sustainability_score: ecoScore,
              product_id: productId,
              created_at: new Date().toISOString(),
              likesCount: 0,
              commentsCount: 0,
            });
            return res.json({ message: 'Checkout finalized', postId: this.lastID });
          }
        );
      });
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to finalize checkout' });
  }
};
