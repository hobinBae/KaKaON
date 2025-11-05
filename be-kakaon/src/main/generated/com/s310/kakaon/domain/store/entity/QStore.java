package com.s310.kakaon.domain.store.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QStore is a Querydsl query type for Store
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QStore extends EntityPathBase<Store> {

    private static final long serialVersionUID = -817685172L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QStore store = new QStore("store");

    public final com.s310.kakaon.global.entity.QBaseEntity _super = new com.s310.kakaon.global.entity.QBaseEntity(this);

    public final StringPath address = createString("address");

    public final ListPath<AlertRecipient, QAlertRecipient> alertRecipient = this.<AlertRecipient, QAlertRecipient>createList("alertRecipient", AlertRecipient.class, QAlertRecipient.class, PathInits.DIRECT2);

    public final ListPath<BusinessHour, QBusinessHour> businessHours = this.<BusinessHour, QBusinessHour>createList("businessHours", BusinessHour.class, QBusinessHour.class, PathInits.DIRECT2);

    public final StringPath businessNumber = createString("businessNumber");

    public final EnumPath<com.s310.kakaon.domain.store.dto.BusinessType> businessType = createEnum("businessType", com.s310.kakaon.domain.store.dto.BusinessType.class);

    public final StringPath city = createString("city");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdDateTime = _super.createdDateTime;

    public final DateTimePath<java.time.LocalDateTime> deletedAt = createDateTime("deletedAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> lastModifiedDateTime = _super.lastModifiedDateTime;

    public final NumberPath<java.math.BigDecimal> latitude = createNumber("latitude", java.math.BigDecimal.class);

    public final NumberPath<java.math.BigDecimal> longitude = createNumber("longitude", java.math.BigDecimal.class);

    public final com.s310.kakaon.domain.member.entity.QMember member;

    public final StringPath name = createString("name");

    public final EnumPath<com.s310.kakaon.domain.store.dto.OperationStatus> operationStatus = createEnum("operationStatus", com.s310.kakaon.domain.store.dto.OperationStatus.class);

    public final StringPath phone = createString("phone");

    public final StringPath postalCode = createString("postalCode");

    public final StringPath state = createString("state");

    public final EnumPath<com.s310.kakaon.domain.store.dto.StoreStatus> status = createEnum("status", com.s310.kakaon.domain.store.dto.StoreStatus.class);

    public QStore(String variable) {
        this(Store.class, forVariable(variable), INITS);
    }

    public QStore(Path<? extends Store> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QStore(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QStore(PathMetadata metadata, PathInits inits) {
        this(Store.class, metadata, inits);
    }

    public QStore(Class<? extends Store> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.member = inits.isInitialized("member") ? new com.s310.kakaon.domain.member.entity.QMember(forProperty("member")) : null;
    }

}

