require('dotenv').config()
const pool   = require('./pool')
const bcrypt = require('bcryptjs')

async function seed() {
  const client = await pool.connect()
  try {
    console.log('Seeding database...')

    // Categories
    await client.query(`
      INSERT INTO categories (slug, name, description, icon, color) VALUES
        ('presyo-talk',    'Presyo Talk',       'Discuss commodity prices, market trends, and daily price changes across the Philippines.', '💰', '#0A3D2E'),
        ('palengke-tips',  'Palengke Tips',     'Best tips for shopping smart at your local wet market. Where to find the freshest and cheapest.', '🏪', '#166534'),
        ('recipe-share',   'Recipe Sharing',    'Share your favorite Filipino recipes and cooking tips. Suggest dishes based on affordable ingredients.', '🍳', '#5B21B6'),
        ('market-watch',   'Market Watch',      'News, alerts, and discussions about commodity price spikes, shortages, and government price controls.', '📈', '#1E3A5F'),
        ('suking-tindahan','Suking Tindahan',   'Rate and recommend your favorite local stores, markets, and suppliers. Help the community find the best deals.', '⭐', '#92400E'),
        ('general',        'General Discussion','General topics, introductions, and community announcements.', '💬', '#374151')
      ON CONFLICT (slug) DO NOTHING
    `)

    // Demo admin user
    const hash = await bcrypt.hash('Admin@123', 12)
    await client.query(`
      INSERT INTO users (username, email, password, avatar, bio, is_admin, karma)
      VALUES ('PalengkeMod', 'admin@palengkewais.ph', $1, '🛒', 'Official moderator of Palengke WAIS community. Keeping prices honest and conversations helpful!', true, 500)
      ON CONFLICT (email) DO NOTHING
    `, [hash])

    // Demo regular user
    const hash2 = await bcrypt.hash('User@1234', 12)
    const { rows: [u2] } = await client.query(`
      INSERT INTO users (username, email, password, avatar, bio, karma)
      VALUES ('NanayMarket', 'nanay@example.com', $1, '👩‍🍳', 'Proud nanay from Quezon City. Shopping the palengke every day since 1995!', 120)
      ON CONFLICT (email) DO NOTHING RETURNING id
    `, [hash2])

    const { rows: [admin] } = await client.query(`SELECT id FROM users WHERE email = 'admin@palengkewais.ph'`)
    const { rows: [cat1] }  = await client.query(`SELECT id FROM categories WHERE slug = 'presyo-talk'`)
    const { rows: [cat2] }  = await client.query(`SELECT id FROM categories WHERE slug = 'palengke-tips'`)
    const { rows: [cat3] }  = await client.query(`SELECT id FROM categories WHERE slug = 'recipe-share'`)
    const { rows: [cat4] }  = await client.query(`SELECT id FROM categories WHERE slug = 'market-watch'`)

    const userId  = admin?.id
    const userId2 = u2?.id

    if (userId && cat1) {
      // Sample posts
      const posts = [
        [
          'Bigas prices in NCR rose again — ₱58/kg at SM vs ₱46/kg at palengke!',
          `Napansin ko ngayon na ang bigas well-milled ay umabot na ng ₱58/kg sa supermarket pero ₱46/kg pa rin sa palengke sa aming lugar (Quezon City).\n\nAng laking difference na ₱12/kg! Kung bumibili ka ng 10kg bawat linggo, ₱120 na ang matitipid mo kada linggo. ₱480/buwan. Malaki na yan para sa isang pamilya!\n\nSaan ka mas mura sa inyo — palengke o supermarket?`,
          userId, cat1.id, 47, 3
        ],
        [
          '5 Tips para makatipid sa palengke — galing sa isang nanay na 20 years nang nagpapaalengke',
          `Bilang isang nanay na 20 taon nang nagpapaalengke, natutunan ko ang mga sikreto ng pagtitipid:\n\n**1. Pumunta ng maaga (6-8am)**\nSariwa ang mga paninda at mas mababang presyo bago pa man mag-araw.\n\n**2. Huwag pumunta ng gutom**\nKung gutom ka, bibili ka ng hindi mo kailangan. Totoo ito!\n\n**3. Regular na suki ang maghanap**\nKung suki ka, bibigyan ka ng dagdag na timbang at mas magandang presyo.\n\n**4. Tingnan ang presyo bago umalis ng bahay**\nGamit ang Palengke WAIS, alam mo na kung magkano dapat ang presyo bago pa lumabas.\n\n**5. Bilhin ang seasonal**\nAng mga gulay at prutas na in-season ay mas mura at mas masustansya.`,
          userId2 || userId, cat2.id, 89, 2
        ],
        [
          'Sinigang na Bangus recipe — tamang-tama sa budget ngayon!',
          `Dahil mura ang bangus ngayon (₱175/kg sa palengke!), dito ang aming pampamilyang recipe:\n\n**Ingredients (para sa 4-5 tao):**\n- 1 kg bangus\n- 1 pack sinigang mix (o fresh sampalok)\n- 3 medium kamatis\n- 1 medium sibuyas\n- 1 bundle kangkong\n- 2 medium radish (labanos)\n- Patis at asin (for taste)\n\n**Instructions:**\n1. Pakuluin ang tubig (8 cups), lagyan ng sibuyas at kamatis.\n2. Ilagay ang bangus. Lutuin ng 10 minuto.\n3. Ilagay ang sinigang mix at radish.\n4. Bago patayin ang apoy, ilagay ang kangkong.\n5. Timplahan ng patis at asin.\n\nKabuuang gastos: mga ₱280-320 para sa buong pamilya. Sulit na sulit!`,
          userId2 || userId, cat3.id, 124, 5
        ],
        [
          'ALERT: Bawang prices spiked — dapat malaman ng lahat!',
          `Ayon sa pinakabagong datos ng DA, ang presyo ng bawang (imported) ay umabot na ng ₱225/kg sa supermarket at ₱180/kg sa palengke sa NCR.\n\nIto ay 35% na pagtaas mula noong nakaraang buwan!\n\n**Dahilan:**\n- Bagyo na nakapinsala sa mga taniman\n- Delayed na imports mula China\n- Speculative buying ng mga ilang traders\n\n**Tip:** Bumili ng native na bawang muna habang mataas ang presyo ng imported. O gumamit ng bawang powder (SM ay mas mura dito).\n\nMay alam pa ba kayong paraan para makatipid sa bawang ngayong mahal?`,
          userId, cat4.id, 203, 8
        ],
      ]

      for (const [title, body, uid, cid, up, down] of posts) {
        await client.query(`
          INSERT INTO posts (title, body, user_id, category_id, upvotes, downvotes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [title, body, uid, cid, up, down])
      }

      // Update category post counts
      await client.query(`
        UPDATE categories c SET post_count = (
          SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id
        )
      `)
    }

    console.log('✅ Seed complete')
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
