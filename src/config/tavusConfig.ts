export const tavusConfig = {
  personality: `You are Riya, a friendly, cheerful, and enthusiastic shopping assistant for our online store.
Your mission is to make each customer's shopping experience effortless, fun, and personalized.
You are highly knowledgeable about all products in our store—including clothing, electronics, beauty items, and home goods.
When a customer asks for product suggestions or inquires about a specific product, respond conversationally and helpfully, drawing on your product knowledge.
You show genuine excitement, just like a helpful in-store assistant would.
Dont ask too many question recommand based on first ask`,

  environment: `Voice shopping assistant providing clear product descriptions and cart management across all devices.`,

  tone: `Warm and friendly conversational style with natural speech patterns and adaptable formality based on customer interaction.`,

  goal: `Guide customers through shopping by:
1. Auto-switching categories (Clothing/Bags/Watches/Shoes)
2. Suggesting products with IDs
3. Displaying cart for checkout review
4. Confirming and processing orders`,

  guardrails: `Stay within store inventory
No personal opinions
Focus on shopping only
Admit knowledge gaps
Maintain professionalism
No PII collection
Ask for clarity when needed`,

  tools: `You have access to the following tools:

\`search_products\`: Use this tool when a customer asks for specific products or suggestions. Display the results naturally within the conversation. The arguments to this tool are free-form text describing the product the user is looking for.

\`add_to_cart\`: Use this tool when the customer wants to purchase an item. Add the product ID to the cart and confirm the addition to the user. The arguments to this tool should be the product ID of the item the user wants to add to the cart.

\`switch_category\`: switch category for switch the category based on the current discussion automatic : ['Clothing', 'Bags', 'Watches', 'Shoes'] -> provide one

\`show_kart\`: Show the cart when the user asks to checkout and wants to place the order for confirmation on what they are about to place. No arguments are needed for this tool.

\`trigger_checkout\`: Trigger this tool when the user confirms the order and says they can submit the order and complete the order, asking for confirmation before triggering the tool. No arguments are needed for this tool.

\`try_on_me\`: before trigger this make sure use selected the photo which he want to try on himself`,

  // Consolidated Product Catalog - Single source of truth organized by categories
  productCatalog: {
    clothing: [
      { 
        id: 'e31dbf6c-ae53-4631-89c7-97738b938d5e', 
        name: 'Embroidered Accent Denim Jacket', 
        price: '$4650', 
        description: 'Premium denim jacket with intricate embroidered accents', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AFTB2',
        keywords: 'Denim, pink, Pinkandblack, Jacket, LV, Cute, trendy, chic, outerwear, casual, embroidered, cropped'
      },
      { 
        id: '195cf471-7028-4e91-b694-036b946f9b38', 
        name: 'Louis Vuitton Monogram Denim Dress', 
        price: '$3250', 
        description: 'Elegant floral jacquard A-line dress with sophisticated silhouette', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AGPKU',
        keywords: 'Denim, A-line Dress, Louis Vuitton, Dresses, Clothing, Elegant, casual, fitted, monogram'
      },
      { 
        id: '975d455d-fc38-4529-a8b8-0601db454a81', 
        name: 'Carabiner Strap Dress', 
        price: '$4750', 
        description: 'Elegant carabiner strap dress with modern design elements', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AI900',
        keywords: 'Carabiner Strap Dress, Modern Design, Louis Vuitton, Elegant, contemporary, unique, statement'
      },
      { 
        id: '12b2c3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6q', 
        name: 'Color_Blocked Pleat Dress', 
        price: '$2600', 
        description: 'Stylish color_blocked pleat dress with contemporary design', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AHGTK',
        keywords: 'Color Blocked Pleat Dress, Contemporary Design, Louis Vuitton, Stylish, modern, vibrant, pleated'
      },
      { 
        id: '2f8e8d0d-85de-4130-8c1b-27f81992916e', 
        name: 'Signature Accent Knit Dress', 
        price: '$4300', 
        description: 'Luxurious signature accent knit dress with refined details', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AI965',
        keywords: 'Knit Dress, Navy, Made in Italy, Sleeveless, Louis Vuitton, Stylish, Vintage, comfortable, fitted'
      },
      { 
        id: '2896a0ce-4764-492a-b502-8d065c75091c', 
        name: 'Striped Lavalliere Dress', 
        price: '$4750', 
        description: 'Elegant striped lavalliere dress with sophisticated styling', 
        designer: 'Louis Vuitton', 
        articleNumber: '1AHH09',
        keywords: 'Striped Lavalliere Dress, Sophisticated Styling, Louis Vuitton, Elegant'
      }
    ],
    bags: [
      { 
        id: 'b85a9238-6747-4c3f-bb41-851f62346475', 
        name: 'Alma BB', 
        price: '$1900', 
        description: 'Iconic structured handbag with timeless appeal', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M46990',
        keywords: 'Iconic Handbag, Louis Vuitton, Small, Cute, Handy, Original, structured, classic, monogram'
      },
      { 
        id: '0de38ed1-2852-46ae-8a13-0dad5a20b9a9', 
        name: 'OnTheGo PM', 
        price: '$4000', 
        description: 'Premium tote bag with sophisticated design and ample space', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M14633',
        keywords: 'Premium Tote Bag, Blue, Monogram, Denim, Louis Vuitton, Officewear, Sophisticated Design, large, spacious'
      },
      { 
        id: '34a8f2e1-5b9c-4d3e-8f7a-1b2c3d4e5f6g', 
        name: 'Hide Away MM', 
        price: '$3400', 
        description: 'Versatile handbag with modern design and practical functionality', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M14473',
        keywords: 'Brown, Monogram, Canvas, Louis Vuitton, Hide Away, Workwear, Weekendwear, versatile, practical'
      },
      { 
        id: 'ff023c9f-721c-4718-a82a-5885df1c3346', 
        name: 'Capucines BB', 
        price: '$7350', 
        description: 'Luxurious handbag with exceptional craftsmanship and elegant design', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M12937',
        keywords: 'Iconic, Rust Red, Gold-toned, Capucines, Luxurious, Craftsmanship, elegant, sophisticated, leather'
      },
      { 
        id: '36b9g3f2-6c0d-5e4f-9g8b-2c3d4e5f6g7h', 
        name: 'Capucines MM Souple', 
        price: '$7750', 
        description: 'Soft and supple version of the iconic Capucines handbag', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M12927',
        keywords: 'Capucines MM Souple, Soft, Supple, Iconic Handbag, Louis Vuitton'
      },
      { 
        id: 'c68d0b4d-1a3b-4dcb-bb50-255af433d1c8', 
        name: 'Neverfull MM', 
        price: '$2990', 
        description: 'Classic tote bag with timeless design and practical size', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M14285',
        keywords: 'Neverfull MM, Classic Tote, Timeless Design, Practical Size, Louis Vuitton'
      },
      { 
        id: '418032eb-dbee-46f4-9453-d9d7bf8d4364', 
        name: 'OnTheGo GM', 
        price: '$3750', 
        description: 'Large tote bag perfect for travel and everyday essentials', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M45945',
        keywords: 'OnTheGo GM, Large Tote, Travel, Everyday Essentials, Louis Vuitton'
      },
      { 
        id: '39c0h4g3-7d1e-6f5g-0h9c-3d4e5f6g7h8i', 
        name: 'Coussin Backpack PM', 
        price: '$4500', 
        description: 'Stylish backpack with quilted design and modern functionality', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M13358',
        keywords: 'Coussin Backpack PM, Quilted Design, Modern Functionality, Louis Vuitton'
      },
      { 
        id: '41d1i5h4-8e2f-7g6h-1i0d-4e5f6g7h8i9j', 
        name: 'Coussin PM', 
        price: '$4600', 
        description: 'Quilted handbag with contemporary design and luxurious feel', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M13313',
        keywords: 'Coussin PM, Quilted Handbag, Contemporary Design, Luxurious Feel, Louis Vuitton'
      },
      { 
        id: '42e2j6i5-9f3g-8h7i-2j1e-5f6g7h8i9j0k', 
        name: 'Christopher MM', 
        price: '$5100', 
        description: 'Sophisticated backpack with premium materials and elegant design', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M13863',
        keywords: 'Christopher MM, Sophisticated Backpack, Premium Materials, Elegant Design, Louis Vuitton'
      },
      { 
        id: '43f3k7j6-0g4h-9i8j-3k2f-6g7h8i9j0k1l', 
        name: 'Trio Messenger', 
        price: '$2900', 
        description: 'Versatile messenger bag with multiple compartments and modern style', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M14069',
        keywords: 'Trio Messenger, Versatile, Multiple Compartments, Modern Style, Louis Vuitton'
      },
      { 
        id: '15bafc34-6561-4858-8b88-9a7fba0aa31c', 
        name: 'Avenue Slingbag PM', 
        price: '$2000', 
        description: 'Compact slingbag perfect for hands-free convenience and style', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M25891',
        keywords: 'Avenue Slingbag PM, Compact, Hands-free Convenience, Style, Louis Vuitton'
      },
      { 
        id: '15bafc34-6561-4858-8b88-9a7fba0aa31c', 
        name: 'Avenue Slingbag PM Macassar', 
        price: '$2100', 
        description: 'Compact slingbag in Monogram Macassar canvas for sophisticated style', 
        designer: 'Louis Vuitton', 
        articleNumber: 'M25892',
        keywords: 'Avenue Slingbag PM, Compact, Hands-free Convenience, Style, Louis Vuitton, monogram, macassar'
      }
    ],
    shoes: [
      { 
        id: '9a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p', 
        name: 'Louis Vuitton LV Isola Flat Mule', 
        price: '$795', 
        description: 'Stylish flat mule with signature LV design elements',
        designer: 'Louis Vuitton',
        articleNumber: '1A9V8W',
        keywords: 'LV Isola, Flat Mule, Stylish, Signature Design, comfortable, slip-on, casual'
      }
    ],
    watches: [
      { 
        id: '18c3d4e5-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 
        name: 'Tambour Street Diver', 
        price: '$5965', 
        description: 'Professional diving watch with quartz movement and steel construction',
        designer: 'Louis Vuitton',
        articleNumber: 'QA058Z',
        keywords: 'steel, white, navy, sporty'
      },
      { 
        id: 'a376d756-cd14-4d03-b271-ec88ba1c1f4d', 
        name: 'Tambour Taiko Spin Time Air', 
        price: '$85500', 
        description: 'Limited Edition masterpiece with flying tourbillon',
        designer: 'Louis Vuitton',
        articleNumber: 'QA059Z',
        keywords: '18-carat, white gold, spin time, dolphin, limited edition'
      }
    ]
  },

  // Helper methods to maintain backward compatibility
  get detailedProductInfo() {
    return this.productCatalog;
  },

  // Get all products as flat array for search functionality
  getAllProducts() {
    return [
      ...this.productCatalog.clothing,
      ...this.productCatalog.bags,
      ...this.productCatalog.shoes,
      ...this.productCatalog.watches
    ];
  },

  // Get products by category
  getProductsByCategory(category: string) {
    const categoryKey = category.toLowerCase();
    return this.productCatalog[categoryKey as keyof typeof this.productCatalog] || [];
  },

  // Find product by ID
  getProductById(id: string | number) {
    const searchId = typeof id === 'number' ? id.toString() : id;
    return this.getAllProducts().find(product => product.id === searchId);
  },

  getPromptText: function() {
    const allProducts = this.getAllProducts();
    return `# Personality\n\n${this.personality}\n\n# Environment\n\n${this.environment}\n\n# Tone\n\n${this.tone}\n\n# Goal\n\n${this.goal}\n\n# Guardrails\n\n${this.guardrails}\n\n# Tools\n\n${this.tools}\n\n## Product Catalog by Categories\n\n| ID | Category | Name | Price | Keywords |\n|----|----------|------|-------|----------|\n${allProducts.map(p => {
      const category = this.productCatalog.clothing.includes(p) ? 'Clothing' : 
                      this.productCatalog.bags.includes(p) ? 'Bags' : 
                      this.productCatalog.shoes.includes(p) ? 'Shoes' : 'Watches';
      return `| ${p.id} | ${category} | ${p.name} | ${p.price} | ${p.keywords} |`;
    }).join('\n')}\n\n## Detailed Product Information by Category:\n\n**Clothing (${this.productCatalog.clothing.length} items):**\n${this.productCatalog.clothing.map(p => `- ID ${p.id}: ${p.name} - ${p.price} (${p.description})`).join('\n')}\n\n**Bags (${this.productCatalog.bags.length} items):**\n${this.productCatalog.bags.map(p => `- ID ${p.id}: ${p.name} - ${p.price} (${p.description})`).join('\n')}\n\n**Shoes (${this.productCatalog.shoes.length} items):**\n${this.productCatalog.shoes.map(p => `- ID ${p.id}: ${p.name} - ${p.price} (${p.description})`).join('\n')}\n\n**Watches (${this.productCatalog.watches.length} items):**\n${this.productCatalog.watches.map(p => `- ID ${p.id}: ${p.name} - ${p.price} (${p.description})`).join('\n')}`;
  }
};

export async function updatePersonaWithShoppingCartTool(personaId: string) {
    const updateData = [
      {
        op: "replace",
        path: "/layers/llm/tools",
        value: [
          {
            type: "function",
            function: {
              name: "search_products",
              description:
                "Use this intelligent search tool when a customer asks for specific products. This tool analyzes customer preferences and automatically selects the BEST SINGLE product match based on context, style, color, occasion, and price range. When multiple products are found, the tool uses AI reasoning to recommend the most suitable option. If the search context is unclear or you need more information to make the best recommendation, ask specific clarifying questions about style preference, occasion, budget, or color. Always return exactly ONE product recommendation with its ID for seamless shopping experience.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description:
                      "Natural language description of what the customer is looking for. Can include style preferences, colors, occasions, price ranges, or any descriptive criteria (e.g., 'red jacket for evening', 'affordable bags under $2000', 'formal wear for business')",
                  },
                  searchContext: {
                    type: "object",
                    properties: {
                      occasion: {
                        type: "string",
                        description: "The occasion or use case (e.g., 'business', 'casual', 'evening', 'formal', 'weekend')"
                      },
                      priceRange: {
                        type: "string",
                        description: "Price preference (e.g., 'under $1000', 'luxury', 'affordable', 'mid-range')"
                      },
                      style: {
                        type: "string",
                        description: "Style preference (e.g., 'modern', 'classic', 'trendy', 'vintage', 'minimalist')"
                      },
                      color: {
                        type: "string",
                        description: "Color preference (e.g., 'red', 'black', 'neutral', 'bright')"
                      }
                    }
                  },
                  type: {
                    type: "object",
                    properties: {
                      productID: {
                        type: ["string", "number"],
                        description: "Specific product ID to search for"
                      },
                      searchType: {
                        type: "string",
                        enum: ["semantic", "exact", "similar", "recommendation"],
                        description: "Type of search to perform: semantic (context-aware), exact (keyword match), similar (find similar items), recommendation (suggest based on preferences)"
                      }
                    }
                  }
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "add_to_cart",
              description:
                "Use this tool ONLY when the customer explicitly says they want to purchase, buy, or add an item to their cart. Do not trigger this during general product discussions or browsing. IMPORTANT: Always pass productId as a string, even if the internal ID is numeric.",
              parameters: {
                type: "object",
                properties: {
                  productId: {
                    type: "string",
                    description:
                      "The product ID of the item the user wants to add to the cart. Must be passed as a string (e.g., '8' not 8).",
                  },
                  response_to_user: {
                    type: "string",
                    description: "Confirmation message to display to the user about the cart addition"
                  }
                },
                required: ["productId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "switch_category",
              description:
                "Use this tool when the customer explicitly mentions wanting to see a different category or asks to browse a specific category like 'show me bags' or 'I want to see watches'.",
              parameters: {
                type: "object",
                properties: {
                  categoryName: {
                    type: "string",
                    description:
                      "The category name the user wants to switch to (Clothing, Bags, Watches, Shoes)",
                  },
                  type: {
                    type: "object",
                    properties: {
                      category: {
                        type: "string",
                        description: "Alternative category format"
                      }
                    }
                  },
                  "type ": {
                    type: "object",
                    properties: {
                      category: {
                        type: "string",
                        description: "Alternative category format with trailing space"
                      }
                    }
                  }
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "show_kart",
              description:
                "Show the cart ONLY when the user explicitly asks to see their cart, checkout, or review their order. Do not trigger during general shopping conversations.",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "trigger_checkout",
              description:
                "Trigger this tool ONLY when the user explicitly confirms they want to complete their order, finalize purchase, or proceed to checkout. Always ask for confirmation before triggering.",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "try_on_me",
              description:
                "Use this tool ONLY when the customer explicitly asks to try on a clothing item virtually. Only works for clothing category items. Make sure the user has selected a photo before triggering this tool.",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
        ],
      },
    ];

    const apiKey = import.meta.env.VITE_TAVUS_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_TAVUS_API_KEY is not defined");
    }

    try {
      const response = await fetch(
        `https://tavusapi.com/v2/personas/${personaId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok && response.status !== 304) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 304 Not Modified as success (persona already has correct tools)
      if (response.status === 304) {
        console.log("Shopping cart tools already up to date (304 Not Modified)");
        return { status: 'not_modified', message: 'Persona tools already configured correctly' };
      }

      const result = await response.json();
      console.log("Shopping cart tool updated successfully:", result);
      return result;
    } catch (error) {
      console.error("Error updating persona with shopping cart tool:", error);
      throw error;
    }
  };