"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpCenterAccordion() {
  const helpItems = [
    {
      id: "item-1",
      title: "How do i withdraw money?",
      description: "You can convert the coins produced daily into USDT, and then initiate a withdrawal. The USDT withdrawal will be automatically sent to the wallet address you added to the node, and other addresses are not supported."
    },
    {
      id: "item-2", 
      title: "How do i need to join?",
      description: "To participate in non-destructive and non-guaranteed liquidity mining, you need to pay an ETH miner's fee to receive the voucher, and an ETH wallet address only needs to be claimed once. Automatically open mining permissions after success."
    },
    {
      id: "item-3",
      title: "How do I join?",
      description: "If you wish to participate in our non-collateral, loss-free liquidity mining project, you will need to pay a certain Ethereum miner fee to receive your certificate. Each Ethereum wallet address only needs to be claimed once. After the transaction is confirmed successfully, your mining permission will automatically take effect."
    },
    {
      id: "item-4",
      title: "How to calculate income?",
      description: "When you successfully join, the smart contract will start counting your address through the node and begin calculating income. Income will be calculated daily, with the full income released 4 times per day, i.e., once every 6 hours. Profit percentages and examples are as follows:\n\nFor example, if you invested $7,000 x 2.5% ÷ 4 = $43.75 (profit per 6 hours), then the total daily profit will be $43.75 x 4 = $175.\n\n$50 to $5,000, profit rate is 2%.\n\n$5,001 to $10,000, profit rate is 2.5%.\n\nOver $10,001, profit rate is 3%."
    }
  ];

  return (
    <div className="help-center-accordion flex flex-col w-full max-w-4xl mx-auto border rounded-xl shadow-sm bg-neutral-900 border-neutral-700 p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        Help Center
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {helpItems.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border-b border-neutral-700"
            style={{ backgroundColor: 'transparent' }}
          >
            <AccordionTrigger 
              className="flex items-center gap-3 py-4 text-left hover:no-underline"
              style={{ 
                backgroundColor: 'transparent !important',
                background: 'transparent !important'
              }}
            >
              <span className="flex-1 font-medium text-white" style={{ color: 'white !important' }}>
                {item.title}
              </span>
            </AccordionTrigger>

            <AccordionContent className="px-2 pb-4 pt-2" style={{ backgroundColor: 'transparent' }}>
              <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line" style={{ color: '#9ca3af !important' }}>
                {item.description}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <style jsx>{`
        :global(.help-center-accordion *) {
          background-color: transparent !important;
          background: transparent !important;
        }
        :global(.help-center-accordion button) {
          background-color: transparent !important;
          background: transparent !important;
        }
        :global(.help-center-accordion [data-state]) {
          background-color: transparent !important;
          background: transparent !important;
        }
        :global(.help-center-accordion [role="button"]) {
          background-color: transparent !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
