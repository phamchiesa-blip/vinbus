import mongoose from "mongoose";

const busRouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["electric", "normal"],
      default: "electric",
    },

    operator: {
      type: String,
      default: "VinBus",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    ticketPrice: {
      type: String,
      default: "",
    },

    distance: {
      type: Number,
      default: 0,
    },

    travelTime: {
      type: String,
      default: "",
    },

    frequency: {
      type: Number,
      default: 0,
    },

    tripsPerDay: {
      type: Number,
      default: 0,
    },

    outbound: {
      start: {
        type: String,
        required: true,
        trim: true,
      },

      end: {
        type: String,
        required: true,
        trim: true,
      },

      stops: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          order: {
            type: Number,
            required: true,
          },
        },
      ],
    },

    inbound: {
      start: {
        type: String,
        required: true,
        trim: true,
      },

      end: {
        type: String,
        required: true,
        trim: true,
      },

      stops: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          order: {
            type: Number,
            required: true,
          },
        },
      ],
    },

    operatingHours: {
      start: {
        type: String,
        required: true,
      },

      end: {
        type: String,
        required: true,
      },
    },

    departureTimes: {
      outbound: {
        type: [String],
        default: [],
      },

      inbound: {
        type: [String],
        default: [],
      },
    },

    images: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BusRoute = mongoose.model("BusRoute", busRouteSchema);

export default BusRoute;