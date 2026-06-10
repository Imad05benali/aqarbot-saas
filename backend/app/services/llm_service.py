import os
from google import genai

class LLMService:
    @staticmethod
    def generate_whatsapp_reply(client_message: str, properties_data: list) -> str:
        """
        Generates a personalized response in Moroccan Darija using the modern google-genai SDK.
        """
        # Initialize modern client (automatically gets GEMINI_API_KEY from .env)
        client = genai.Client()
        
        context_properties = ""
        for prop in properties_data:
            agency = prop.get("agency", {})
            context_properties += f"""
            - Title: {prop.get('title')}
            - Price: {prop.get('price')} DH/month
            - Sector: {prop.get('sector')}
            - City: {prop.get('city')}
            - Agency Contact: {agency.get('name', 'N/A')} (Phone: {agency.get('phone', 'N/A')}, Email: {agency.get('email', 'N/A')})
            ----------------------
            """

        system_prompt = f"""
        You are 'AqarBot AI', a smart, friendly, and professional Moroccan real estate agent assistant.
        Your goal is to reply to a client on WhatsApp who is looking for a property.
        
        You must reply in warm, polite, and natural Moroccan Darija using Latin/Arabizi characters (e.g., 'Mar7ba khoya/khti', 'kayn had l-khyar...', 'taman dyalo...').
        
        Rules:
        1. Be concise (WhatsApp messages should be clean and not too long).
        2. Use emojis like 🏠, 📍, 💰, 📞 to make it beautiful.
        3. Base your response strictly on the matched properties provided below. Do NOT invent properties.
        4. If a property matches, highlight its Sector and Price, and guide them to contact the agency.
        5. If no properties were found, politely tell them that we don't have an exact match right now but you will keep looking for them.

        Client's Message: "{client_message}"
        
        Matched Database Context:
        {context_properties if properties_data else "No properties found matching this query in the database."}
        """

        try:
            # Using 'gemini-2.5-flash' which is the standard, fast, and stable model now
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=system_prompt,
            )
            return response.text.strip()
        except Exception as e:
            print(f"ERROR: Error generating content from Gemini GenAI: {str(e)}")
            return "Mar7ba khoya, sma7 lia bzaf kayn chi mouchkil f l-sistim dialna 7alyan. Ghadi n7awlo n-9addo l-amour f l-blasa!"