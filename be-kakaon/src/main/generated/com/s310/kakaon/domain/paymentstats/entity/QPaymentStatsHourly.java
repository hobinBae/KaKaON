package com.s310.kakaon.domain.paymentstats.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPaymentStatsHourly is a Querydsl query type for PaymentStatsHourly
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPaymentStatsHourly extends EntityPathBase<PaymentStatsHourly> {

    private static final long serialVersionUID = 2131081897L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPaymentStatsHourly paymentStatsHourly = new QPaymentStatsHourly("paymentStatsHourly");

    public final NumberPath<Integer> hour = createNumber("hour", Integer.class);

    public final NumberPath<java.math.BigDecimal> hourlyTotalSales = createNumber("hourlyTotalSales", java.math.BigDecimal.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPaymentStats paymentStats;

    public QPaymentStatsHourly(String variable) {
        this(PaymentStatsHourly.class, forVariable(variable), INITS);
    }

    public QPaymentStatsHourly(Path<? extends PaymentStatsHourly> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPaymentStatsHourly(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPaymentStatsHourly(PathMetadata metadata, PathInits inits) {
        this(PaymentStatsHourly.class, metadata, inits);
    }

    public QPaymentStatsHourly(Class<? extends PaymentStatsHourly> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.paymentStats = inits.isInitialized("paymentStats") ? new QPaymentStats(forProperty("paymentStats"), inits.get("paymentStats")) : null;
    }

}

