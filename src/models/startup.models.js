import mongoose, { Schema } from "mongoose";

const StartupSchema = new Schema(
  {
    founder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    investors: [
      {
        type: Schema.Types.ObjectId,
        refrence: "Investor",
      },
    ],

    pitch: {
      basics: {
        companyname: {
          type: String,
          required: true,
          unique: true,
        },
        category: {
          type: String,
        },
        image: {
          type: String, //cloudinary
        },
        video: {
          type: String, //cloudinary
        },
        address: {
          type: String,
          required: true,
        },
        links: {
          website: String,
          twitter: String,
          linkedin: String,
          instagram: String,
          youtube: String,
          facebook: String,
          blog: String,
        },
        logo: {
          type: String, //cloudinary
        },
        description: {
          type: String,
          required: true,
        },
        url: {
          type: String,
        },
        pan:{
          type:String //cloudinary
        },
        aadhar:{
          type:String //cloudinary
        }
      },

      highlights: [
        {
          type: String,
        },
      ],

      teams: [
        {
          name: {
            type: String,
          },
          email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
          },
          accomplishment: {
            type: Boolean,
            default: false,
          },
          linkedin: {
            type: String,
          },
          twitter: {
            type: String,
          },
        },
      ],

      featuredInvestor: [
        {
          name: {
            type: Schema.Types.ObjectId,
            refrence: "Investor",
          },
          bio: { type: String },
          linkedin: {
            type: String,
          },
          quote: {
            type: String,
          },
          investmentOnSame: {
            type: Number,
          },
          pastInvestment: {
            type: String,
          },
          angleInvestor: {
            type: Boolean,
          },
          vc: {
            type: Boolean,
          },
        },
      ],

      pitch:{
        pitch_title:{
          type:String
        },
        htmlData:{
          type:String
        }
      }
    },

    terms: {
      contract: {
        contractName:{
          type: String
        },
        valuation_cap:{
          type: Number
        },
        discount:{
          type:Number
        },
        interest_rate:{
          type:Number
        },
        payback:{
          type:Number
        },
        investor_revenue_per:{
          type:Number
        },
        simple_interest_rate:{
          type:Number
        },
        repayment:{
          type:String
        },
        loan_term:{
          type:Number
        },
        pre_money_valuation:{
          type:Number
        },
        investor_advise:{
          type:String
        },
        terms_to_vip: {
          type: String,
        },
      },

      perks: [
        {
          investOver: {
            type: Number,
          },
          toReceive: {
            type: String,
          },
        },
      ],
    },

    raise: {
      fundingGoals: {
        maximumRaise: {
          type: Number,
        },
        minimumRaise: {
          type: Number,
        },
        capitalRaisedPreviously: {
          type: Number,
          default: 0,
        },
        capitalRaised: {
          type: Number,
          default: 0,
        },
        countdown: {
          date: {
            type: Date,
          },
          time: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
          },
        },
      },

      discoverability: {
        access: {
          type: String,
        },
        venturelistURL: [
          {
            type: String,
          },
        ],
      },
      extra: {
        investor_massage: {
          type: String,
        },
        anlytics: {
          google_anlytics: {
            type: String,
          },
          google_tag_manager: {
            type: String,
          },
          facebookTracking: {
            pixel_id: {
              type: String,
            },
            conversion_token: {
              type: String,
            },
            registered_Domain: {
              type: String,
            },
            test_event_code: {
              type: String,
            },
          },
        },
      },
    },

    other: {
      type: String,
    },
  },

  { timestamps: true }
);

export const Startup = mongoose.model("Startup", StartupSchema);
